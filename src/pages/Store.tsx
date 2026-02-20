// ============================================
// Visual Store — Main Page with 3D Models
// ============================================

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import { Coins, Gem, Star, Zap, Shield, Swords } from 'lucide-react';
import { showPopup, hapticImpact } from '../lib/telegram';
import CharactersTab from '@/components/store/CharactersTab';
import WeaponsTab from '@/components/store/WeaponsTab';
import GearTab from '@/components/store/GearTab';

type StoreTab = 'characters' | 'weapons' | 'gear';

const Store = () => {
  const { user, updateUser } = useAuth();
  const [selectedTab, setSelectedTab] = useState<StoreTab>('characters');

  if (!user) return null;

  // For now, owned items tracked locally (will come from inventory table)
  const ownedCharacters = [user.selectedSkin, 'viper_snake']; // default: owns viper_snake (common starter)
  const ownedWeapons = ['k416']; // K416 is free starter weapon
  const ownedGear: string[] = [];

  const handlePurchase = async (item: { id: string; price: number; currency: 'k_coins' | 'k_gems'; nameAr: string }) => {
    hapticImpact('medium');
    if (item.currency === 'k_coins') {
      if (user.coins < item.price) {
        showPopup('رصيد غير كافٍ من العملات!', 'فشل الشراء');
        return;
      }
      await updateUser({ coins: user.coins - item.price });
    } else {
      if (user.gems < item.price) {
        showPopup('رصيد غير كافٍ من الجواهر!', 'فشل الشراء');
        return;
      }
      await updateUser({ gems: user.gems - item.price });
    }
    showPopup(`تم شراء ${item.nameAr} بنجاح!`, 'مبروك 🎉');
  };

  const handleEquipSkin = async (skinId: string) => {
    hapticImpact('light');
    await updateUser({ selectedSkin: skinId });
  };

  const handleEquipWeapon = async (_weaponId: string) => {
    hapticImpact('light');
    // TODO: persist equipped weapon
  };

  const tabs: { key: StoreTab; label: string; icon: React.ReactNode }[] = [
    { key: 'characters', label: 'الشخصيات', icon: <Star size={14} /> },
    { key: 'weapons', label: 'الأسلحة', icon: <Swords size={14} /> },
    { key: 'gear', label: 'التجهيزات', icon: <Shield size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gradient-primary">المتجر</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-card px-3 py-1.5 rounded-lg border border-border">
            <Coins size={16} className="text-gold" />
            <span className="text-sm font-bold text-foreground">{user.coins}</span>
          </div>
          <div className="flex items-center gap-1 bg-card px-3 py-1.5 rounded-lg border border-primary/20">
            <Gem size={16} className="text-primary" />
            <span className="text-sm font-bold text-foreground">{user.gems}</span>
          </div>
        </div>
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

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {selectedTab === 'characters' && (
          <CharactersTab
            ownedItems={ownedCharacters}
            equippedSkin={user.selectedSkin}
            coins={user.coins}
            gems={user.gems}
            onPurchase={handlePurchase}
            onEquip={handleEquipSkin}
          />
        )}
        {selectedTab === 'weapons' && (
          <WeaponsTab
            ownedItems={ownedWeapons}
            equippedWeapon="k416"
            coins={user.coins}
            gems={user.gems}
            onPurchase={handlePurchase}
            onEquip={handleEquipWeapon}
          />
        )}
        {selectedTab === 'gear' && (
          <GearTab
            ownedItems={ownedGear}
            coins={user.coins}
            gems={user.gems}
            onPurchase={handlePurchase}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Store;
