// ============================================
// ملف: src/components/Wiki.tsx
// الوظيفة: صفحة معلومات الأسلحة التفاعلية
// ============================================

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Volume2, X } from 'lucide-react'

interface Weapon {
  id: string
  name: string
  image: string
  damage: number
  fireRate: number // طلقات في الثانية
  sound: string // مسار الصوت (يمكن استخدام Web Audio API)
  description: string
}

const weapons: Weapon[] = [
  {
    id: 'ak47',
    name: 'AK-47',
    image: '🔫',
    damage: 15,
    fireRate: 8,
    sound: '/sounds/ak47.mp3',
    description: 'سلاح هجومي متوسط المدى، قوة نيران عالية.',
  },
  {
    id: 'm4',
    name: 'M4',
    image: '🔫',
    damage: 12,
    fireRate: 10,
    sound: '/sounds/m4.mp3',
    description: 'دقيق وسريع، مناسب للمعارك القريبة.',
  },
  {
    id: 'sniper',
    name: 'Sniper',
    image: '🔭',
    damage: 30,
    fireRate: 1,
    sound: '/sounds/sniper.mp3',
    description: 'قناص بعيد المدى، طلقة واحدة قاتلة.',
  },
  {
    id: 'shotgun',
    name: 'Shotgun',
    image: '🔫',
    damage: 20,
    fireRate: 2,
    sound: '/sounds/shotgun.mp3',
    description: 'مدفع قريب المدى، يوزع الضرر على مساحة.',
  },
]

const Wiki = () => {
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null)
  const [playing, setPlaying] = useState<string | null>(null)

  const playSound = (weaponId: string) => {
    // في التطبيق الحقيقي، يمكن استخدام Howler.js أو Web Audio API
    // هنا نكتفي بمحاكاة الصوت
    setPlaying(weaponId)
    setTimeout(() => setPlaying(null), 500)
    // يمكن إضافة تأثير اهتزاز
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-20">
      <h1 className="text-2xl font-bold text-kilegram-blue mb-6">معلومات الأسلحة</h1>

      <div className="grid grid-cols-2 gap-4">
        {weapons.map((weapon) => (
          <motion.div
            key={weapon.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-slate-800 rounded-xl p-4 border border-white/10 cursor-pointer"
            onClick={() => setSelectedWeapon(weapon)}
          >
            <div className="text-5xl text-center mb-2">{weapon.image}</div>
            <h3 className="text-center font-bold">{weapon.name}</h3>
            <div className="flex justify-center items-center gap-2 mt-2 text-sm text-gray-300">
              <span>🔫 {weapon.damage}</span>
              <span>⚡ {weapon.fireRate}/s</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                playSound(weapon.id)
              }}
              className="mt-2 w-full py-1 bg-white/10 rounded-lg flex items-center justify-center gap-2 text-sm"
            >
              <Volume2 size={16} />
              {playing === weapon.id ? '🔊' : 'صوت'}
            </button>
          </motion.div>
        ))}
      </div>

      {/* نافذة التفاصيل */}
      {selectedWeapon && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedWeapon(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-kilegram-blue"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-kilegram-blue">{selectedWeapon.name}</h2>
              <button onClick={() => setSelectedWeapon(null)} className="text-gray-400">
                <X size={24} />
              </button>
            </div>
            <div className="text-7xl text-center mb-4">{selectedWeapon.image}</div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>الضرر:</span>
                <span className="text-kill-red font-bold">{selectedWeapon.damage}</span>
              </div>
              <div className="flex justify-between">
                <span>معدل الإطلاق:</span>
                <span>{selectedWeapon.fireRate} طلقة/ثانية</span>
              </div>
              <p className="text-gray-300 mt-4">{selectedWeapon.description}</p>
            </div>
            <button
              onClick={() => playSound(selectedWeapon.id)}
              className="mt-6 w-full py-3 bg-gradient-to-r from-kilegram-blue to-kill-red rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Volume2 size={20} />
              {playing === selectedWeapon.id ? '🔊 جاري التشغيل' : 'استمع إلى الصوت'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default Wiki