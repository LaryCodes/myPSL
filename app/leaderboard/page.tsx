'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import LeaderboardTable from '@/components/LeaderboardTable'
import Navbar from '@/components/Navbar'
import FloatingBackground from '@/components/FloatingBackground'
import { LeaderboardEntry } from '@/lib/leaderboard'

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setUserId(user.id)

    const response = await fetch('/api/leaderboard')
    const data = await response.json()
    setEntries(data)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto p-8 text-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <FloatingBackground />
      <Navbar />
      <div className="relative z-10 max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-psl-yellow mb-8">Leaderboard</h1>
        <LeaderboardTable entries={entries} currentUserId={userId || undefined} />
      </div>
    </div>
  )
}
