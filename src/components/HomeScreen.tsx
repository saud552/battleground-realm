import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSquad } from '../context/SquadContext'
import { motion } from 'framer-motion'
import { Users, QrCode, Skull, Trophy, Coins } from 'lucide-react'
import JoinModal from './JoinModal'

const HomeScreen = () => {
  const { user } = useAuth()
  const { createSquad, joinSquad } = useSquad()
  const navigate = useNavigate()
  const [joinModalOpen, setJoinModalOpen] = useState(false)

  const handleCreateTeam = async () => {
    await createSquad()
    navigate('/lobby')
  }

  const handleJoinViaCode = () => {
    setJoinModalOpen(true)
  }

  const handleJoin = async (code: string) => {
    const success = await joinSquad(code)
    if (success) {
      navigate('/lobby')
    }
    return success
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      {/* الشريط العلوي */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-kilegram-blue to-kill-red flex items-center justify-center text-xl">
            {user.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{user.username}</span>
              <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-gray-300">
                ID: {user.id}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <span>{user.country}</span>
              <span>Yemen</span>
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-400">Online</div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="px-4 py-8 flex flex-col items-center">
        {/* زر BATTLE الضخم */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              '0 0 20px #00a6ff',
              '0 0 40px #ff3b3b',
              '0 0 20px #00a6ff',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-64 h-64 rounded-full bg-gradient-to-br from-kilegram-blue to-kill-red text-5xl font-black uppercase tracking-wider text-white border-4 border-white/20 shadow-2xl"
        >
          BATTLE
        </motion.button>

        {/* الأزرار الثانوية */}
        <div className="flex gap-4 mt-8 w-full max-w-sm">
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={handleCreateTeam}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-white/5 border border-white/10 text-white backdrop-blur-sm hover:bg-white/10 transition"
          >
            <Users size={20} className="text-kilegram-blue" />
            Create Team
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={handleJoinViaCode}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-white/5 border border-white/10 text-white backdrop-blur-sm hover:bg-white/10 transition"
          >
            <QrCode size={20} className="text-kill-red" />
            Join via Code
          </motion.button>
        </div>

        {/* بطاقة الإحصائيات */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 w-full max-w-sm bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 border border-white/10 shadow-xl"
        >
          <h3 className="text-sm font-semibold text-gray-400 mb-3">PLAYER STATS</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <Skull className="w-6 h-6 mx-auto text-kill-red mb-1" />
              <div className="text-xl font-bold">0</div>
              <div className="text-xs text-gray-400">Kills</div>
            </div>
            <div className="text-center">
              <Trophy className="w-6 h-6 mx-auto text-yellow-500 mb-1" />
              <div className="text-xl font-bold">0</div>
              <div className="text-xs text-gray-400">Wins</div>
            </div>
            <div className="text-center">
              <Coins className="w-6 h-6 mx-auto text-kilegram-blue mb-1" />
              <div className="text-xl font-bold">500</div>
              <div className="text-xs text-gray-400">Coins</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* نافذة الانضمام */}
      <JoinModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        onJoin={handleJoin}
      />
    </div>
  )
}

export default HomeScreen