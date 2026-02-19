import { Home, Store, Users, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/store', icon: Store, label: 'Store' },
  { to: '/squad', icon: Users, label: 'Squad' },
  { to: '/profile', icon: User, label: 'Profile' },
]

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-md border-t border-white/10 py-2 px-6">
      <div className="flex justify-around items-center">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-xs transition-colors ${
                isActive ? 'text-kilegram-blue' : 'text-gray-400 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} className={isActive ? 'drop-shadow-glow' : ''} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav