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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      const response = await fetch('/api/leaderboard', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to load leaderboard: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('Leaderboard data:', data)
      
      if (Array.isArray(data)) {
        setEntries(data)
      } else {
        throw new Error('Invalid leaderboard data format')
      }
    } catch (err: any) {
      console.error('Error loading leaderboard:', err)
      setError(err.message || 'Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto p-8 text-center">
          <div className="glass rounded-lg p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-psl-yellow mx-auto mb-4"></div>
            <p className="text-gray-400">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto p-8 text-center">
          <div className="glass rounded-lg p-12 border-red-500/50">
            <p className="text-red-400 mb-4">❌ {error}</p>
            <button 
              onClick={loadLeaderboard}
              className="btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="min-h-screen">
        <FloatingBackground />
        <Navbar />
        <div className="relative z-10 max-w-7xl mx-auto p-3 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-psl-yellow mb-4">Leaderboard</h1>
          <div className="glass rounded-lg p-12 text-center">
            <p className="text-gray-400">No players yet. Be the first to predict!</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <FloatingBackground />
      <Navbar />
      <div className="relative z-10 max-w-7xl mx-auto p-3 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-psl-yellow mb-4">Leaderboard</h1>
        <LeaderboardTable entries={entries} currentUserId={userId || undefined} />
      </div>
    </div>
  )
}
