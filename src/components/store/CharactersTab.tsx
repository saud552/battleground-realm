// ============================================
// Store — Characters Tab Component
// ============================================

import React from 'react';
import { motion } from 'framer-motion';
import { Coins, Gem, Check, ShoppingCart, Crown } from 'lucide-react';
import { CHARACTERS, RARITY_COLORS, type CharacterDef } from '@/lib/gameRegistry';
import ModelViewer from './ModelViewer';
import CharacterModel3D from '@/components/models/CharacterModel3D';

interface CharactersTabProps {
  ownedItems: string[];
  equippedSkin: string;
  coins: number;
  gems: number;
  onPurchase: (item: CharacterDef) => void;
  onEquip: (itemId: string) => void;
}

const CharactersTab: React.FC<CharactersTabProps> = ({ ownedItems, equippedSkin, coins, gems, onPurchase, onEquip }) => (
  <motion.div
    key="characters"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="grid grid-cols-2 gap-3"
  >
    {CHARACTERS.map(char => {
      const owned = ownedItems.includes(char.id);
      const equipped = equippedSkin === char.id;
      const rarity = RARITY_COLORS[char.rarity];
      const canAfford = char.currency === 'k_coins' ? coins >= char.price : gems >= char.price;

      return (
        <motion.div
          key={char.id}
          whileTap={{ scale: 0.97 }}
          className={`bg-card rounded-xl border overflow-hidden transition-all ${
            equipped ? `${rarity.border} ${rarity.glow}` : 'border-border'
          }`}
        >
          {/* 3D Model */}
          <ModelViewer height="h-40">
            <CharacterModel3D character={char} scale={1.1} />
          </ModelViewer>

          <div className="p-3">
            {/* Rarity badge */}
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] font-bold uppercase ${rarity.text}`}>{char.rarity}</span>
              {char.rarity === 'legendary' && <Crown size={12} className="text-gold" />}
            </div>

            <h3 className="font-bold text-foreground text-sm">{char.nameAr}</h3>
            <p className="text-[10px] text-muted-foreground mb-2">{char.name}</p>

            {/* Price */}
            {char.price > 0 && (
              <div className="flex items-center gap-1 mb-2 text-sm">
                {char.currency === 'k_gems' ? (
                  <><Gem size={13} className="text-primary" /><span className="text-primary font-bold">{char.price}</span></>
                ) : (
                  <><Coins size={13} className="text-gold" /><span className="text-gold font-bold">{char.price}</span></>
                )}
              </div>
            )}

            {/* Actions */}
            {equipped ? (
              <div className="w-full py-2 bg-primary/20 text-primary rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold">
                <Check size={14} /> مُجهّز
              </div>
            ) : owned ? (
              <button onClick={() => onEquip(char.id)} className="w-full py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold hover:bg-secondary/80 transition">
                تجهيز
              </button>
            ) : (
              <button
                onClick={() => onPurchase(char)}
                disabled={!canAfford}
                className={`w-full py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold transition ${
                  canAfford ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                <ShoppingCart size={14} /> شراء
              </button>
            )}
          </div>
        </motion.div>
      );
    })}
  </motion.div>
);

export default CharactersTab;
