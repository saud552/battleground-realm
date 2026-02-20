// ============================================
// Store — Gear Tab (Helmets & Backpacks)
// ============================================

import React from 'react';
import { motion } from 'framer-motion';
import { Coins, Gem, Check, ShoppingCart, Shield, Package } from 'lucide-react';
import { HELMETS, BACKPACKS, RARITY_COLORS } from '@/lib/gameRegistry';
import ModelViewer from './ModelViewer';
import GearModel3D from '@/components/models/GearModel3D';

interface GearTabProps {
  ownedItems: string[];
  coins: number;
  gems: number;
  onPurchase: (item: { id: string; price: number; currency: 'k_coins' | 'k_gems'; nameAr: string }) => void;
}

const GearTab: React.FC<GearTabProps> = ({ ownedItems, coins, gems, onPurchase }) => (
  <motion.div
    key="gear"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
  >
    {/* Helmets Section */}
    <div className="flex items-center gap-2 mb-3">
      <Shield size={16} className="text-primary" />
      <h3 className="text-sm font-bold text-foreground">الخوذات</h3>
    </div>
    <div className="grid grid-cols-3 gap-2 mb-6">
      {HELMETS.map(helmet => {
        const owned = ownedItems.includes(helmet.id);
        const rarity = RARITY_COLORS[helmet.rarity];
        const canAfford = helmet.currency === 'k_coins' ? coins >= helmet.price : gems >= helmet.price;

        return (
          <motion.div
            key={helmet.id}
            whileTap={{ scale: 0.96 }}
            className={`bg-card rounded-xl border overflow-hidden transition-all ${rarity.border} ${rarity.glow}`}
          >
            <ModelViewer height="h-28">
              <GearModel3D gearId={helmet.id} gearType="helmet" scale={2.5} color={helmet.color} />
            </ModelViewer>
            <div className="p-2">
              <span className={`text-[9px] font-bold uppercase ${rarity.text}`}>{helmet.rarity}</span>
              <h4 className="font-bold text-foreground text-[11px] leading-tight">{helmet.nameAr}</h4>
              <p className="text-[9px] text-muted-foreground mb-1">🛡️ {helmet.armor} درع</p>
              {owned ? (
                <div className="text-[9px] text-neon-green font-semibold flex items-center gap-0.5"><Check size={10} /> مملوك</div>
              ) : (
                <button
                  onClick={() => onPurchase(helmet)}
                  disabled={!canAfford}
                  className={`w-full py-1 rounded-md text-[10px] font-semibold transition ${
                    canAfford ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {helmet.currency === 'k_gems' ? <><Gem size={10} className="inline" /> {helmet.price}</> : <><Coins size={10} className="inline" /> {helmet.price}</>}
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>

    {/* Backpacks Section */}
    <div className="flex items-center gap-2 mb-3">
      <Package size={16} className="text-neon-green" />
      <h3 className="text-sm font-bold text-foreground">الحقائب</h3>
    </div>
    <div className="grid grid-cols-3 gap-2">
      {BACKPACKS.map(bp => {
        const owned = ownedItems.includes(bp.id);
        const rarity = RARITY_COLORS[bp.rarity];
        const canAfford = bp.currency === 'k_coins' ? coins >= bp.price : gems >= bp.price;

        return (
          <motion.div
            key={bp.id}
            whileTap={{ scale: 0.96 }}
            className={`bg-card rounded-xl border overflow-hidden transition-all ${rarity.border} ${rarity.glow}`}
          >
            <ModelViewer height="h-28">
              <GearModel3D gearId={bp.id} gearType="backpack" scale={2.5} color={bp.color} />
            </ModelViewer>
            <div className="p-2">
              <span className={`text-[9px] font-bold uppercase ${rarity.text}`}>{bp.rarity}</span>
              <h4 className="font-bold text-foreground text-[11px] leading-tight">{bp.nameAr}</h4>
              <p className="text-[9px] text-muted-foreground mb-1">📦 {bp.capacity} سعة</p>
              {owned ? (
                <div className="text-[9px] text-neon-green font-semibold flex items-center gap-0.5"><Check size={10} /> مملوك</div>
              ) : (
                <button
                  onClick={() => onPurchase(bp)}
                  disabled={!canAfford}
                  className={`w-full py-1 rounded-md text-[10px] font-semibold transition ${
                    canAfford ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {bp.currency === 'k_gems' ? <><Gem size={10} className="inline" /> {bp.price}</> : <><Coins size={10} className="inline" /> {bp.price}</>}
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  </motion.div>
);

export default GearTab;
