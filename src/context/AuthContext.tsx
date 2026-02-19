import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getUserData, initTelegramApp } from '@/lib/telegram';

// ============================================
// Types
// ============================================

export interface Skin {
  id: string;
  name: string;
  price: number;
  emoji: string;
  imageUrl: string; // alias for emoji, for backward compat
}

export const AVAILABLE_SKINS: Skin[] = [
  { id: 'soldier', name: 'الجندي', price: 0, emoji: '🪖', imageUrl: '🪖' },
  { id: 'medic', name: 'المسعف', price: 0, emoji: '💊', imageUrl: '💊' },
  { id: 'sniper_skin', name: 'القناص', price: 0, emoji: '🎯', imageUrl: '🎯' },
  { id: 'commander', name: 'القائد', price: 50, emoji: '⭐', imageUrl: '⭐' },
];

export interface UserProfile {
  id: string;
  userId: string;
  telegramId: string | null;
  username: string;
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
  country: string | null;
  coins: number;
  gems: number;
  xp: number;
  level: number;
  totalKills: number;
  totalWins: number;
  totalMatches: number;
  selectedSkin: string;
  ownedSkins: string[];
  isBanned: boolean;
  role: 'admin' | 'player';
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isOnline: boolean;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  selectSkin: (skinId: string) => Promise<boolean>;
  purchaseSkin: (skinId: string) => Promise<boolean>;
  addCoins: (amount: number) => Promise<void>;
  addXP: (amount: number) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// Helpers
// ============================================

const getCountryFromLanguage = (langCode?: string): string => {
  const map: Record<string, string> = {
    en: '🇺🇸', ar: '🇸🇦', fr: '🇫🇷', es: '🇪🇸', ru: '🇷🇺', zh: '🇨🇳',
    de: '🇩🇪', ja: '🇯🇵', ko: '🇰🇷', pt: '🇧🇷',
  };
  return map[langCode || 'en'] || '🏳️';
};

const mapProfileRow = (row: any, role: 'admin' | 'player' = 'player'): UserProfile => ({
  id: row.id,
  userId: row.user_id,
  telegramId: row.telegram_id,
  username: row.username,
  firstName: row.first_name,
  lastName: row.last_name,
  photoUrl: row.photo_url,
  country: row.country,
  coins: row.k_coins ?? 0,
  gems: row.k_gems ?? 0,
  xp: row.xp ?? 0,
  level: row.level ?? 1,
  totalKills: row.total_kills ?? 0,
  totalWins: row.total_wins ?? 0,
  totalMatches: row.total_matches ?? 0,
  selectedSkin: row.selected_skin ?? 'soldier',
  ownedSkins: ['soldier', 'medic', 'sniper_skin'], // TODO: fetch from inventory table
  isBanned: row.is_banned ?? false,
  role,
});

// ============================================
// Provider
// ============================================

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  const fetchRole = async (userId: string): Promise<'admin' | 'player'> => {
    try {
      const { data } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
      return data ? 'admin' : 'player';
    } catch {
      return 'player';
    }
  };

  const loadOrCreateProfile = useCallback(async () => {
    try {
      initTelegramApp();
      const tgUser = getUserData();

      // Try to find existing profile by telegram_id
      if (tgUser) {
        const { data: existing } = await supabase
          .from('profiles')
          .select('*')
          .eq('telegram_id', tgUser.id)
          .maybeSingle();

        if (existing) {
          const role = await fetchRole(existing.user_id);
          setUser(mapProfileRow(existing, role));
          setIsOnline(true);
          return;
        }

        // Create new profile for Telegram user
        const { data: newProfile, error } = await supabase
          .from('profiles')
          .insert({
            user_id: tgUser.id,
            telegram_id: tgUser.id,
            username: tgUser.username || tgUser.firstName,
            first_name: tgUser.firstName,
            last_name: tgUser.lastName || null,
            photo_url: tgUser.photoUrl || null,
            country: getCountryFromLanguage(tgUser.languageCode),
            k_coins: 100,
            k_gems: 0,
            xp: 0,
            level: 1,
            selected_skin: 'soldier',
          })
          .select()
          .single();

        if (newProfile && !error) {
          setUser(mapProfileRow(newProfile));
          setIsOnline(true);
          return;
        }
      }

      // Fallback: offline mock user for development
      setIsOnline(false);
      setUser({
        id: 'mock-id',
        userId: 'dev-12345',
        telegramId: null,
        username: '@Khayal_Dev',
        firstName: 'Khayal',
        lastName: null,
        photoUrl: null,
        country: '🇾🇪',
        coins: 500,
        gems: 10,
        xp: 0,
        level: 1,
        totalKills: 0,
        totalWins: 0,
        totalMatches: 0,
        ownedSkins: ['soldier', 'medic', 'sniper_skin'],
        selectedSkin: 'soldier',
        isBanned: false,
        role: 'player',
      });
    } catch (err) {
      console.error('Auth init failed:', err);
      setIsOnline(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrCreateProfile();
  }, [loadOrCreateProfile]);

  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    // Map front-end keys to DB columns
    const dbUpdates: Record<string, any> = {};
    if (updates.coins !== undefined) dbUpdates.k_coins = updates.coins;
    if (updates.gems !== undefined) dbUpdates.k_gems = updates.gems;
    if (updates.xp !== undefined) dbUpdates.xp = updates.xp;
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    if (updates.totalKills !== undefined) dbUpdates.total_kills = updates.totalKills;
    if (updates.totalWins !== undefined) dbUpdates.total_wins = updates.totalWins;
    if (updates.totalMatches !== undefined) dbUpdates.total_matches = updates.totalMatches;
    if (updates.selectedSkin !== undefined) dbUpdates.selected_skin = updates.selectedSkin;
    if (updates.username !== undefined) dbUpdates.username = updates.username;

    const merged = { ...user, ...updates };
    setUser(merged);

    if (isOnline && Object.keys(dbUpdates).length > 0) {
      await supabase.from('profiles').update(dbUpdates).eq('id', user.id);
    }
  };

  const selectSkin = async (skinId: string): Promise<boolean> => {
    if (!user) return false;
    const skin = AVAILABLE_SKINS.find(s => s.id === skinId);
    if (!skin) return false;
    await updateUser({ selectedSkin: skinId });
    return true;
  };

  const purchaseSkin = async (skinId: string): Promise<boolean> => {
    if (!user) return false;
    const skin = AVAILABLE_SKINS.find(s => s.id === skinId);
    if (!skin || skin.price === 0 || user.coins < skin.price) return false;

    // Add to inventory
    if (isOnline) {
      await supabase.from('inventory').insert({
        user_id: user.userId,
        item_id: skinId,
        item_name: skin.name,
        item_type: 'skin',
        is_equipped: false,
      });
    }

    await updateUser({ coins: user.coins - skin.price });
    return true;
  };

  const addCoins = async (amount: number) => {
    if (!user) return;
    await updateUser({ coins: user.coins + amount });
  };

  const addXP = async (amount: number) => {
    if (!user) return;
    const newXP = user.xp + amount;
    const newLevel = Math.floor(Math.sqrt(newXP / 50)) + 1;
    await updateUser({ xp: newXP, level: newLevel });
  };

  const refreshProfile = async () => {
    await loadOrCreateProfile();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isOnline, updateUser, selectSkin, purchaseSkin, addCoins, addXP, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
