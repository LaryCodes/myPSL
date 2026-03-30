'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', icon: '🏠', label: 'Home' },
    { href: '/matches', icon: '🏏', label: 'Matches' },
    { href: '/ultimate-call', icon: '👑', label: 'Ultimate' },
    { href: '/leaderboard', icon: '🏆', label: 'Ranks' },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800/50 backdrop-blur-2xl bg-black/60">
      <div className="flex justify-around items-center px-2 py-2">
        {navItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-300 min-w-[70px] ${
                isActive
                  ? item.href === '/ultimate-call'
                    ? 'bg-gradient-to-b from-amber-500/20 to-yellow-600/20 scale-105'
                    : 'bg-gradient-to-b from-psl-red/20 to-red-700/20 scale-105'
                  : 'hover:bg-white/5'
              }`}
            >
              <span className={`text-2xl mb-1 ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
              <span className={`text-[10px] font-bold ${
                isActive
                  ? item.href === '/ultimate-call'
                    ? 'text-amber-400'
                    : 'text-psl-yellow'
                  : 'text-gray-400'
              }`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
