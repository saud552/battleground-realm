// ============================================
// ملف: src/components/CharacterSelect.tsx
// الوظيفة: شاشة اختيار المقاتل (مرة واحدة عند أول دخول)
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth, AVAILABLE_SKINS } from '../context/AuthContext';
import { hapticImpact, showPopup } from '../lib/telegram';
import { Coins, Lock } from 'lucide-react';

const CharacterSelect = () => {
  const { user, selectSkin, purchaseSkin } = useAuth();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(user?.selectedSkin || 'soldier');

  // إذا تم اختيار الشخصية مسبقاً (لن يظهر للمستخدم مرة أخرى إلا إذا لم يختر)
  // لكننا نضمن أن هذه الشاشة تظهر فقط للمستخدمين الجدد عبر App.tsx

  const handleSelect = (skinId: string) => {
    setSelectedId(skinId);
    hapticImpact('light');
  };

  const handleConfirm = async () => {
    if (!user) return;
    
    const skin = AVAILABLE_SKINS.find(s => s.id === selectedId);
    if (!skin) return;

    // إذا كانت الشخصية مدفوعة وغير مملوكة
    if (skin.price > 0 && !user.ownedSkins.includes(selectedId)) {
      const success = await purchaseSkin(selectedId);
      if (success) {
        showPopup('تم شراء الشخصية بنجاح!', 'مبروك');
        navigate('/');
      } else {
        showPopup('رصيد غير كافٍ!', 'فشل الشراء');
      }
      return;
    }

    // إذا كانت مجانية أو مملوكة بالفعل
    selectSkin(selectedId);
    navigate('/');
  };

  // إذا لم يكن المستخدم محملًا بعد، نعرض مؤشر تحميل
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-kilegram-blue animate-pulse">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-kilegram-blue to-kill-red">
          اختر مقاتلك
        </h1>
        <p className="text-gray-400 mt-2">اختر شخصيتك لتبدأ المعركة</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {AVAILABLE_SKINS.map((skin) => {
          const isOwned = user.ownedSkins.includes(skin.id);
          const isSelected = selectedId === skin.id;
          const canAfford = user.coins >= skin.price;

          return (
            <motion.div
              key={skin.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 
                border-2 cursor-pointer transition-all
                ${isSelected ? 'border-kilegram-blue shadow-lg shadow-kilegram-blue/20' : 'border-white/10'}
                ${!isOwned && skin.price > 0 ? 'opacity-80' : ''}
              `}
              onClick={() => handleSelect(skin.id)}
            >
              {/* أيقونة الشخصية */}
              <div className="text-6xl text-center mb-2">{skin.imageUrl}</div>
              
              {/* الاسم والسعر */}
              <div className="text-center">
                <p className="font-semibold">{skin.name}</p>
                {skin.price > 0 && !isOwned && (
                  <div className="flex items-center justify-center gap-1 text-sm mt-1">
                    <Coins size={16} className="text-yellow-500" />
                    <span className={canAfford ? 'text-green-400' : 'text-red-400'}>
                      {skin.price}
                    </span>
                  </div>
                )}
              </div>

              {/* مؤشر القفل إذا كانت غير مملوكة ومدفوعة */}
              {!isOwned && skin.price > 0 && (
                <div className="absolute top-2 right-2">
                  <Lock size={16} className="text-gray-400" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* عرض الرصيد الحالي */}
      <div className="flex justify-center items-center gap-2 mb-6">
        <Coins size={24} className="text-yellow-500" />
        <span className="text-xl font-bold">{user.coins}</span>
      </div>

      {/* زر التأكيد */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleConfirm}
        className="w-full py-4 bg-gradient-to-r from-kilegram-blue to-kill-red rounded-xl font-bold text-lg shadow-lg"
      >
        تأكيد الاختيار
      </motion.button>

      <p className="text-center text-xs text-gray-500 mt-4">
        يمكنك تغيير شخصيتك لاحقاً من المتجر
      </p>
    </div>
  );
};

export default CharacterSelect;