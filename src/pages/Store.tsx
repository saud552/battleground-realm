// ============================================
// Store - Character Skins, Weapon Cosmetics & Coin Packs
// ============================================

import React, { useState } from 'react';
import { useAuth, AVAILABLE_SKINS } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Check, ShoppingCart, Sparkles, Star, Zap } from 'lucide-react';
import { showPopup, hapticImpact, openLink } from '../lib/telegram';
import { WEAPONS } from '@/lib/weapons';
import { getLevelTitle } from '@/lib/xpSystem';

// Weapon skin tiers (cosmetic levels 1-5)
const WEAPON_SKIN_TIERS = [
  { level: 1, name: 'أساسي', nameEn: 'Base', price: 0, color: 'text-muted-foreground', border: 'border-border', glow: '' },
  { level: 2, name: 'مُحسّن', nameEn: 'Enhanced', price: 50, color: 'text-neon-green', border: 'border-neon-green/30', glow: 'shadow-[0_0_8px_hsl(var(--neon-green)/0.3)]' },
  { level: 3, name: 'نادر', nameEn: 'Rare', price: 150, color: 'text-kilegram-blue', border: 'border-kilegram-blue/30', glow: 'shadow-[0_0_12px_hsl(var(--kilegram-blue)/0.3)]' },
  { level: 4, name: 'أسطوري', nameEn: 'Legendary', price: 400, color: 'text-gold', border: 'border-gold/30', glow: 'shadow-[0_0_16px_hsl(var(--gold)/0.4)]' },
  { level: 5, name: 'ملكي', nameEn: 'Mythic', price: 800, color: 'text-kill-red', border: 'border-kill-red/30', glow: 'shadow-[0_0_20px_hsl(var(--kill-red)/0.4)]' },
];

const COIN_PACKS = [
  { id: 'pack_1', coins: 500, bonus: 50, price: '$1.99', emoji: '💰' },
  { id: 'pack_2', coins: 1200, bonus: 150, price: '$4.99', emoji: '💎', popular: true },
  { id: 'pack_3', coins: 2500, bonus: 400, price: '$9.99', emoji: '👑' },
];

type StoreTab = 'skins' | 'weapons' | 'coins';

const Store = () => {
  const { user, purchaseSkin, selectSkin, addCoins } = useAuth();
  const [selectedTab, setSelectedTab] = useState<StoreTab>('skins');
  const [selectedWeapon, setSelectedWeapon] = useState(Object.keys(WEAPONS)[0]);

  if (!user) return null;

  const handlePurchaseSkin = async (skinId: string) => {
    hapticImpact('medium');
    const success = await purchaseSkin(skinId);
    if (success) showPopup('تم شراء الشخصية بنجاح!', 'مبروك');
    else showPopup('رصيد غير كافٍ!', 'فشل الشراء');
  };

  const handleSelectSkin = async (skinId: string) => {
    hapticImpact('light');
    await selectSkin(skinId);
  };

  const handleBuyCoins = (_amount: number) => {
    hapticImpact('light');
    openLink('https://t.me/send?start=pay_coins');
  };

  const tabs: { key: StoreTab; label: string; icon: React.ReactNode }[] = [
    { key: 'skins', label: 'الشخصيات', icon: <Star size={14} /> },
    { key: 'weapons', label: 'الأسلحة', icon: <Zap size={14} /> },
    { key: 'coins', label: 'العملات', icon: <Coins size={14} /> },
  ];

  const weaponList = Object.values(WEAPONS);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 pb-20">
      <h1 className="text-2xl font-bold text-primary mb-2">المتجر</h1>

      {/* Balance bar */}
      <div className="flex items-center gap-2 mb-4 bg-card p-3 rounded-xl border border-border">
        <Coins size={22} className="text-gold" />
        <span className="text-xl font-bold text-foreground">{user.coins}</span>
        <span className="text-muted-foreground ml-auto text-sm">رصيدك</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5 bg-card rounded-xl p-1 border border-border">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              selectedTab === tab.key
                ? 'gradient-primary text-primary-foreground shadow-neon'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* CHARACTER SKINS TAB */}
        {selectedTab === 'skins' && (
          <motion.div
            key="skins"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-2 gap-3"
          >
            {AVAILABLE_SKINS.map(skin => {
              const owned = user.ownedSkins.includes(skin.id);
              const selected = user.selectedSkin === skin.id;
              const canAfford = user.coins >= skin.price;

              return (
                <motion.div
                  key={skin.id}
                  whileTap={{ scale: 0.97 }}
                  className={`bg-card rounded-xl p-4 border transition-all ${
                    selected ? 'border-primary shadow-neon' : 'border-border'
                  }`}
                >
                  <div className="text-5xl text-center mb-2">{skin.imageUrl}</div>
                  <h3 className="text-center font-bold text-foreground text-sm">{skin.name}</h3>
                  {skin.price > 0 ? (
                    <div className="flex items-center justify-center gap-1 mt-1 text-sm text-gold">
                      <Coins size={14} />
                      <span>{skin.price}</span>
                    </div>
                  ) : (
                    <p className="text-center text-neon-green text-xs mt-1">مجاني</p>
                  )}

                  {selected ? (
                    <div className="mt-3 w-full py-2 bg-primary/20 text-primary rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold">
                      <Check size={14} />
                      مُختار
                    </div>
                  ) : owned ? (
                    <button
                      onClick={() => handleSelectSkin(skin.id)}
                      className="mt-3 w-full py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold hover:bg-secondary/80 transition"
                    >
                      اختيار
                    </button>
                  ) : skin.price > 0 ? (
                    <button
                      onClick={() => handlePurchaseSkin(skin.id)}
                      disabled={!canAfford}
                      className={`mt-3 w-full py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold transition ${
                        canAfford
                          ? 'gradient-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart size={14} />
                      شراء
                    </button>
                  ) : (
                    <div className="mt-3 w-full py-2 bg-neon-green/20 text-neon-green rounded-lg flex items-center justify-center gap-1.5 text-xs">
                      <Check size={14} />
                      مملوك
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* WEAPON SKINS TAB */}
        {selectedTab === 'weapons' && (
          <motion.div
            key="weapons"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Weapon selector */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {weaponList.map(w => (
                <button
                  key={w.id}
                  onClick={() => setSelectedWeapon(w.id)}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    selectedWeapon === w.id
                      ? 'bg-primary/20 text-primary border-primary/40'
                      : 'bg-card text-muted-foreground border-border hover:border-primary/20'
                  }`}
                >
                  {w.emoji} {w.nameAr}
                </button>
              ))}
            </div>

            {/* Skin tiers for selected weapon */}
            <div className="space-y-3">
              {WEAPON_SKIN_TIERS.map(tier => {
                const weapon = WEAPONS[selectedWeapon];
                const isOwned = tier.level === 1; // Base level always owned
                const canAfford = user.coins >= tier.price;

                return (
                  <motion.div
                    key={tier.level}
                    whileTap={{ scale: 0.98 }}
                    className={`bg-card rounded-xl p-4 border ${tier.border} ${tier.glow} transition-all`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`text-lg font-black ${tier.color}`}>Lv.{tier.level}</div>
                        <div>
                          <span className={`text-sm font-bold ${tier.color}`}>{tier.name}</span>
                          <p className="text-xs text-muted-foreground">{weapon.nameAr} — {tier.nameEn}</p>
                        </div>
                      </div>
                      {tier.level >= 4 && <Sparkles size={18} className={tier.color} />}
                    </div>

                    {/* Visual preview bar */}
                    <div className="bg-muted rounded-full h-1.5 mb-3 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${tier.level * 20}%`,
                          background: tier.level <= 2
                            ? 'hsl(var(--neon-green))'
                            : tier.level <= 3
                              ? 'hsl(var(--kilegram-blue))'
                              : tier.level <= 4
                                ? 'hsl(var(--gold))'
                                : 'hsl(var(--kill-red))',
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      {tier.price === 0 ? (
                        <span className="text-xs text-neon-green">مجاني</span>
                      ) : (
                        <div className="flex items-center gap-1 text-sm text-gold">
                          <Coins size={14} />
                          {tier.price}
                        </div>
                      )}
                      {isOwned ? (
                        <span className="text-xs text-neon-green font-semibold">✓ مملوك</span>
                      ) : (
                        <button
                          disabled={!canAfford}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                            canAfford
                              ? 'gradient-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground cursor-not-allowed'
                          }`}
                        >
                          شراء
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* COINS TAB */}
        {selectedTab === 'coins' && (
          <motion.div
            key="coins"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {COIN_PACKS.map(pack => (
              <motion.div
                key={pack.id}
                whileTap={{ scale: 0.98 }}
                className={`bg-card rounded-xl p-4 border transition-all relative ${
                  pack.popular ? 'border-gold/40 shadow-[0_0_12px_hsl(var(--gold)/0.2)]' : 'border-border'
                }`}
              >
                {pack.popular && (
                  <div className="absolute -top-2.5 right-4 bg-gold text-primary-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    الأكثر شعبية
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{pack.emoji}</span>
                    <div>
                      <h3 className="font-bold text-foreground">{pack.coins} عملة</h3>
                      <p className="text-xs text-neon-green">+ مكافأة {pack.bonus}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBuyCoins(pack.coins)}
                    className="gradient-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-sm shadow-neon"
                  >
                    {pack.price}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Store;
