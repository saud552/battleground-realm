// ============================================
// ملف: src/context/AuthContext.tsx
// الوظيفة: إدارة بيانات المستخدم (تيليجرام + العملات + الشخصيات)
// ============================================

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getUserData, initTelegramApp } from '../lib/telegram';

// أنواع الشخصيات المتاحة
export interface Skin {
  id: string;
  name: string;
  price: number; // 0 تعني مجانية
  imageUrl: string; // يمكن أن يكون رمزاً تعبيرياً أو رابط صورة
}

// الشخصيات الافتراضية
export const AVAILABLE_SKINS: Skin[] = [
  { id: 'soldier', name: 'الجندي', price: 0, imageUrl: '🪖' },
  { id: 'medic', name: 'المسعف', price: 0, imageUrl: '💊' },
  { id: 'sniper', name: 'القناص', price: 0, imageUrl: '🎯' },
  { id: 'commander', name: 'القائد', price: 50, imageUrl: '⭐' }, // مدفوع
];

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  country: string; // رمز البلد (مشتق من اللغة أو يختاره المستخدم)
  coins: number;
  selectedSkin: string; // id of the skin
  ownedSkins: string[]; // قائمة ids للشخصيات المملوكة
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  updateUser: (updates: Partial<User>) => void;
  selectSkin: (skinId: string) => boolean; // true إذا نجح الاختيار
  purchaseSkin: (skinId: string) => boolean; // true إذا نجح الشراء
  addCoins: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// دالة مساعدة لاستخراج رمز البلد من اللغة (مؤقتة)
const getCountryFromLanguage = (langCode?: string): string => {
  // يمكن تحسينها لاحقاً بخريطة حقيقية، أو طلب من المستخدم
  const map: Record<string, string> = {
    en: '🇺🇸',
    ar: '🇸🇦',
    fr: '🇫🇷',
    es: '🇪🇸',
    ru: '🇷🇺',
    zh: '🇨🇳',
  };
  return map[langCode || 'en'] || '🏳️';
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // تهيئة تطبيق تيليجرام
    initTelegramApp();

    // محاولة تحميل البيانات من localStorage أولاً (لأن المستخدم قد يكون اختار شخصية مسبقاً)
    const storedUser = localStorage.getItem('kilegram_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoading(false);
      return;
    }

    // إذا لم يوجد في localStorage، نستخدم بيانات تيليجرام
    const tgUser = getUserData();
    if (tgUser) {
      const newUser: User = {
        id: tgUser.id,
        username: tgUser.username || `${tgUser.firstName} ${tgUser.lastName || ''}`.trim(),
        firstName: tgUser.firstName,
        lastName: tgUser.lastName,
        photoUrl: tgUser.photoUrl,
        country: getCountryFromLanguage(tgUser.languageCode),
        coins: 100, // هدية ترحيبية
        selectedSkin: 'soldier', // الشخصية الافتراضية
        ownedSkins: ['soldier', 'medic', 'sniper'], // يمتلك المجانية فقط
      };
      setUser(newUser);
      localStorage.setItem('kilegram_user', JSON.stringify(newUser));
    } else {
      // للاختبار المحلي (بدون تيليجرام) - نستخدم بيانات وهمية
      const mockUser: User = {
        id: '12345',
        username: '@Khayal_Dev',
        firstName: 'Khayal',
        photoUrl: '👤',
        country: '🇾🇪',
        coins: 500,
        selectedSkin: 'soldier',
        ownedSkins: ['soldier', 'medic', 'sniper'],
      };
      setUser(mockUser);
      localStorage.setItem('kilegram_user', JSON.stringify(mockUser));
    }
    setIsLoading(false);
  }, []);

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('kilegram_user', JSON.stringify(updated));
  };

  const selectSkin = (skinId: string): boolean => {
    if (!user) return false;
    const skin = AVAILABLE_SKINS.find(s => s.id === skinId);
    if (!skin) return false;
    // التحقق من امتلاك الشخصية
    if (!user.ownedSkins.includes(skinId) && skin.price > 0) return false;
    updateUser({ selectedSkin: skinId });
    return true;
  };

  const purchaseSkin = (skinId: string): boolean => {
    if (!user) return false;
    const skin = AVAILABLE_SKINS.find(s => s.id === skinId);
    if (!skin || skin.price === 0) return false;
    if (user.ownedSkins.includes(skinId)) return false; // يمتلكها بالفعل
    if (user.coins < skin.price) return false; // رصيد غير كاف

    const updatedUser = {
      ...user,
      coins: user.coins - skin.price,
      ownedSkins: [...user.ownedSkins, skinId],
    };
    setUser(updatedUser);
    localStorage.setItem('kilegram_user', JSON.stringify(updatedUser));
    return true;
  };

  const addCoins = (amount: number) => {
    if (!user) return;
    updateUser({ coins: user.coins + amount });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, updateUser, selectSkin, purchaseSkin, addCoins }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};