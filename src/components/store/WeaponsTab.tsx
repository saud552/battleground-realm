// ============================================
// Store — Weapons Tab Component
// ============================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, Gem, Check, ShoppingCart, Crown, Crosshair, Zap, Target, Gauge } from 'lucide-react';
import { WEAPON_CATALOG, RARITY_COLORS, type WeaponDef } from '@/lib/gameRegistry';
import ModelViewer from './ModelViewer';
import WeaponModel3D from '@/components/models/WeaponModel3D';

interface WeaponsTabProps {
  ownedItems: string[];
  equippedWeapon: string;
  coins: number;
  gems: number;
  onPurchase: (item: WeaponDef) => void;
  onEquip: (itemId: string) => void;
}

const StatBar = ({ label, value, max, icon }: { label: string; value: number; max: number; icon: React.ReactNode }) => (
  <div className="flex items-center gap-1.5 text-[10px]">
    {icon}
    <span className="text-muted-foreground w-10">{label}</span>
    <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min((value / max) * 100, 100)}%` }} />
    </div>
  </div>
);

const WeaponsTab: React.FC<WeaponsTabProps> = ({ ownedItems, equippedWeapon, coins, gems, onPurchase, onEquip }) => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <motion.div
      key="weapons"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-3"
    >
      {WEAPON_CATALOG.map(weapon => {
        const owned = ownedItems.includes(weapon.id);
        const equipped = equippedWeapon === weapon.id;
        const rarity = RARITY_COLORS[weapon.rarity];
        const canAfford = weapon.currency === 'k_coins' ? coins >= weapon.price : gems >= weapon.price;
        const expanded = selected === weapon.id;

        return (
          <motion.div
            key={weapon.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelected(expanded ? null : weapon.id)}
            className={`bg-card rounded-xl border overflow-hidden transition-all cursor-pointer ${
              equipped ? `${rarity.border} ${rarity.glow}` : 'border-border'
            }`}
          >
            <div className="flex items-stretch">
              {/* 3D Model */}
              <div className="w-36 flex-shrink-0">
                <ModelViewer height="h-28">
                  <WeaponModel3D weaponId={weapon.id} scale={0.9} />
                </ModelViewer>
              </div>

              <div className="flex-1 p-3 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold uppercase ${rarity.text}`}>{weapon.rarity}</span>
                  {weapon.rarity === 'legendary' && <Crown size={12} className="text-gold" />}
                </div>

                <h3 className="font-bold text-foreground text-sm">{weapon.name}</h3>
                <p className="text-[10px] text-muted-foreground mb-1">{weapon.nameAr} · {weapon.ammoType}</p>

                {/* Quick stats */}
                <div className="space-y-0.5">
                  <StatBar label="ضرر" value={weapon.damage} max={65} icon={<Crosshair size={10} className="text-kill-red" />} />
                  <StatBar label="معدل" value={1000 / weapon.fireRate} max={15} icon={<Zap size={10} className="text-gold" />} />
                  <StatBar label="مدى" value={weapon.bulletRange} max={1000} icon={<Target size={10} className="text-primary" />} />
                </div>
              </div>
            </div>

            {/* Expanded details */}
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="border-t border-border px-3 py-3"
              >
                <p className="text-xs text-muted-foreground mb-2">{weapon.description}</p>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] mb-3">
                  <div className="bg-muted/50 rounded-lg p-1.5">
                    <div className="font-bold text-foreground">{weapon.magazineSize}</div>
                    <div className="text-muted-foreground">مخزن</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-1.5">
                    <div className="font-bold text-foreground">{(weapon.reloadTime / 1000).toFixed(1)}s</div>
                    <div className="text-muted-foreground">إعادة تعبئة</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-1.5">
                    <div className="font-bold text-foreground">{weapon.pelletsPerShot > 1 ? `${weapon.pelletsPerShot}x` : '1x'}</div>
                    <div className="text-muted-foreground">طلقة</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {weapon.price > 0 ? (
                    <div className="flex items-center gap-1 text-sm">
                      {weapon.currency === 'k_gems' ? (
                        <><Gem size={14} className="text-primary" /><span className="text-primary font-bold">{weapon.price}</span></>
                      ) : (
                        <><Coins size={14} className="text-gold" /><span className="text-gold font-bold">{weapon.price}</span></>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-neon-green font-semibold">مجاني</span>
                  )}

                  {equipped ? (
                    <span className="text-xs text-primary font-semibold flex items-center gap-1"><Check size={14} /> مُجهّز</span>
                  ) : owned ? (
                    <button onClick={(e) => { e.stopPropagation(); onEquip(weapon.id); }} className="px-4 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold">
                      تجهيز
                    </button>
                  ) : weapon.price > 0 ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); onPurchase(weapon); }}
                      disabled={!canAfford}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                        canAfford ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart size={14} className="inline mr-1" /> شراء
                    </button>
                  ) : (
                    <span className="text-xs text-neon-green font-semibold flex items-center gap-1"><Check size={14} /> مملوك</span>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default WeaponsTab;
