'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import ProfileModal from './ProfileModal'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [showProfile, setShowProfile] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('')

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUserId(user.id)
      const { data } = await supabase
        .from('user_profiles')
        .select('name')
        .eq('id', user.id)
        .single()
      
      if (data) {
        setUserName(data.name)
      }
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    document.cookie = 'sb-access-token=; Max-Age=0; path=/'
    router.push('/login')
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/matches', label: 'Matches' },
    { href: '/ultimate-call', label: 'Ultimate Call', special: true },
    { href: '/leaderboard', label: 'Leaderboard' },
  ]

  return (
    <nav className="sticky top-0 z-50 glass border-b border-red-900/30 backdrop-blur-2xl bg-black/40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex justify-between items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 md:gap-8">
            <h1 className="text-base sm:text-xl md:text-2xl font-black tracking-tight" style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #dc2626 50%, #fbbf24 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              backgroundSize: '200% auto',
              animation: 'shine 3s linear infinite'
            }}>
              🏏 PSL
            </h1>
            <div className="hidden md:flex gap-2">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-full transition-all duration-300 font-semibold text-sm ${
                    pathname === link.href
                      ? link.special
                        ? 'bg-gradient-to-r from-amber-500 to-psl-yellow text-black shadow-lg shadow-amber-500/50 scale-105'
                        : 'bg-gradient-to-r from-psl-red to-red-700 text-white shadow-lg shadow-psl-red/50 scale-105'
                      : link.special
                        ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                        : 'text-gray-300 hover:text-psl-yellow hover:bg-white/5'
                  }`}
                >
                  {link.special && '👑 '}{link.label}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowProfile(true)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-psl-yellow to-amber-500 text-black font-bold text-xs sm:text-sm hover:shadow-lg hover:shadow-psl-yellow/50 transition-all duration-300 hover:scale-105"
            >
              👤 {userName || 'Profile'}
            </button>
            <button
              onClick={handleLogout}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gray-600 text-gray-300 hover:border-psl-red hover:text-psl-red transition-all duration-300 text-xs sm:text-sm font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {userId && (
        <ProfileModal 
          isOpen={showProfile} 
          onClose={() => {
            setShowProfile(false)
            loadUser()
          }} 
          userId={userId} 
        />
      )}
    </nav>
  )
}
