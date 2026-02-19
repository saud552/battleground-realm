// ============================================
// ملف: src/pages/Store.tsx
// الوظيفة: متجر لشراء الشخصيات والعملات
// ============================================

import React, { useState } from 'react'
import { useAuth, AVAILABLE_SKINS } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { Coins, Lock, Check, ShoppingCart } from 'lucide-react'
import { showPopup, hapticImpact, openLink } from '../lib/telegram'

const Store = () => {
  const { user, purchaseSkin, addCoins } = useAuth()
  const [selectedTab, setSelectedTab] = useState<'skins' | 'coins'>('skins')

  if (!user) return null

  const handlePurchaseSkin = async (skinId: string, price: number) => {
    hapticImpact('medium')
    const success = await purchaseSkin(skinId)
    if (success) {
      showPopup('تم شراء الشخصية بنجاح!', 'مبروك')
    } else {
      showPopup('رصيد غير كافٍ!', 'فشل الشراء')
    }
  }

  const handleBuyCoins = (amount: number, price: number) => {
    // هنا يمكن فتح رابط دفع تيليجرام Stars أو TON
    hapticImpact('light')
    // محاكاة لعملية شراء
    openLink('https://t.me/send?start=pay_coins') // رابط وهمي
    // بعد الدفع الحقيقي، يتم استدعاء addCoins من الخادم
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-20">
      <h1 className="text-2xl font-bold text-kilegram-blue mb-2">المتجر</h1>
      <div className="flex items-center gap-2 mb-6 bg-slate-900 p-3 rounded-xl">
        <Coins size={24} className="text-yellow-500" />
        <span className="text-xl font-bold">{user.coins}</span>
        <span className="text-gray-400 ml-auto">رصيدك</span>
      </div>

      {/* تبويبات */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSelectedTab('skins')}
          className={`flex-1 py-3 rounded-xl font-semibold transition ${
            selectedTab === 'skins'
              ? 'bg-gradient-to-r from-kilegram-blue to-kill-red text-white'
              : 'bg-white/5 text-gray-400'
          }`}
        >
          الشخصيات
        </button>
        <button
          onClick={() => setSelectedTab('coins')}
          className={`flex-1 py-3 rounded-xl font-semibold transition ${
            selectedTab === 'coins'
              ? 'bg-gradient-to-r from-kilegram-blue to-kill-red text-white'
              : 'bg-white/5 text-gray-400'
          }`}
        >
          العملات
        </button>
      </div>

      {selectedTab === 'skins' && (
        <div className="grid grid-cols-2 gap-4">
          {AVAILABLE_SKINS.map((skin) => {
            const owned = user.ownedSkins.includes(skin.id)
            const canAfford = user.coins >= skin.price

            return (
              <motion.div
                key={skin.id}
                whileHover={{ scale: 1.03 }}
                className="bg-slate-800 rounded-xl p-4 border border-white/10"
              >
                <div className="text-5xl text-center mb-2">{skin.imageUrl}</div>
                <h3 className="text-center font-bold">{skin.name}</h3>
                {skin.price > 0 ? (
                  <div className="flex items-center justify-center gap-1 mt-2 text-sm">
                    <Coins size={16} className="text-yellow-500" />
                    <span>{skin.price}</span>
                  </div>
                ) : (
                  <p className="text-center text-green-400 text-sm mt-2">مجاني</p>
                )}
                {owned ? (
                  <div className="mt-3 w-full py-2 bg-green-600/30 text-green-400 rounded-lg flex items-center justify-center gap-2">
                    <Check size={16} />
                    <span>مملوك</span>
                  </div>
                ) : skin.price > 0 ? (
                  <button
                    onClick={() => handlePurchaseSkin(skin.id, skin.price)}
                    disabled={!canAfford}
                    className={`mt-3 w-full py-2 rounded-lg flex items-center justify-center gap-2 ${
                      canAfford
                        ? 'bg-gradient-to-r from-kilegram-blue to-kill-red'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart size={16} />
                    شراء
                  </button>
                ) : (
                  <button className="mt-3 w-full py-2 bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed">
                    مجاني
                  </button>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {selectedTab === 'coins' && (
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold">500 عملات</h3>
                <p className="text-sm text-gray-400">+ مكافأة 50</p>
              </div>
              <span className="text-xl font-bold text-yellow-500">$1.99</span>
            </div>
            <button
              onClick={() => handleBuyCoins(500, 1.99)}
              className="w-full py-3 bg-gradient-to-r from-kilegram-blue to-kill-red rounded-lg font-semibold"
            >
              شراء
            </button>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold">1200 عملات</h3>
                <p className="text-sm text-gray-400">+ مكافأة 150</p>
              </div>
              <span className="text-xl font-bold text-yellow-500">$4.99</span>
            </div>
            <button
              onClick={() => handleBuyCoins(1200, 4.99)}
              className="w-full py-3 bg-gradient-to-r from-kilegram-blue to-kill-red rounded-lg font-semibold"
            >
              شراء
            </button>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold">2500 عملات</h3>
                <p className="text-sm text-gray-400">+ مكافأة 400</p>
              </div>
              <span className="text-xl font-bold text-yellow-500">$9.99</span>
            </div>
            <button
              onClick={() => handleBuyCoins(2500, 9.99)}
              className="w-full py-3 bg-gradient-to-r from-kilegram-blue to-kill-red rounded-lg font-semibold"
            >
              شراء
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Store