import { motion } from 'framer-motion'
import { useEffect } from 'react'

interface SplashScreenProps {
  onFinish: () => void
}

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 3000) // 3 ثوانٍ
    return () => clearTimeout(timer)
  }, [onFinish])

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50">
      <div className="relative">
        {/* خلفية شبكية */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00a6ff10_1px,transparent_1px),linear-gradient(to_bottom,#00a6ff10_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative text-center"
        >
          <motion.h1
            animate={{ textShadow: ['0 0 10px #00a6ff', '0 0 30px #ff3b3b', '0 0 10px #00a6ff'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-kilegram-blue via-white to-kill-red"
          >
            KILEGRAM
          </motion.h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="h-1 bg-gradient-to-r from-kilegram-blue to-kill-red mt-4"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="text-gray-400 mt-4 text-sm tracking-widest"
          >
            ENTER THE BATTLEFIELD
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}

export default SplashScreen