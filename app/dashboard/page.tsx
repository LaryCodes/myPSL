'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getAllMatchesWithStatus, MatchWithStatus } from '@/lib/matches'
import MatchCard from '@/components/MatchCard'
import Navbar from '@/components/Navbar'
import FloatingBackground from '@/components/FloatingBackground'
import StatsCard from '@/components/StatsCard'

type UserPrediction = {
  match_id: string
  predicted_team: string
  edit_count: number
}

type UserStats = {
  totalPredictions: number
  correctPredictions: number
  currentStreak: number
  points: number
}

export default function DashboardPage() {
  const [matches, setMatches] = useState<MatchWithStatus[]>([])
  const [predictions, setPredictions] = useState<UserPrediction[]>([])
  const [stats, setStats] = useState<UserStats>({ totalPredictions: 0, correctPredictions: 0, currentStreak: 0, points: 0 })
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setUserId(user.id)
    
    // Get only next 24 hours matches (upcoming soon)
    const allMatches = getAllMatchesWithStatus()
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    
    const nextDayMatches = allMatches.filter(m => {
      const matchDate = new Date(m.match_datetime)
      return !m.result && matchDate >= now && matchDate <= tomorrow
    })
    
    setMatches(nextDayMatches)

    const { data: userPredictions } = await supabase
      .from('predictions')
      .select('match_id, predicted_team, edit_count')
      .eq('user_id', user.id)
      .eq('is_final', true)

    if (userPredictions) {
      setPredictions(userPredictions)
      
      // Calculate quick stats
      const leaderboardRes = await fetch('/api/leaderboard')
      const leaderboard = await leaderboardRes.json()
      const userEntry = leaderboard.find((e: any) => e.user_id === user.id)
      
      if (userEntry) {
        setStats({
          totalPredictions: userPredictions.length,
          correctPredictions: 0,
          currentStreak: userEntry.current_streak,
          points: userEntry.total_points
        })
      }
    }

    setLoading(false)
  }

  const handlePredict = async (matchId: string, team: string) => {
    const existing = predictions.find(p => p.match_id === matchId)
    const endpoint = existing ? '/api/predictions/update' : '/api/predictions'
    const method = existing ? 'PUT' : 'POST'

    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ match_id: matchId, predicted_team: team })
    })

    if (response.ok) {
      await loadData()
    } else {
      const error = await response.json()
      alert(error.error || 'Failed to save prediction')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <FloatingBackground />
        <Navbar />
        <div className="relative z-10 max-w-7xl mx-auto p-8 text-center">
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
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4" style={{
            background: 'linear-gradient(135deg, #fbbf24, #dc2626)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Your Dashboard
          </h1>
          <p className="text-gray-400 text-lg">Next 24 Hours - Don't Miss Out!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <StatsCard label="Total Points" value={stats.points} icon="🏆" />
          <StatsCard label="Predictions Made" value={stats.totalPredictions} icon="🎯" />
          <StatsCard label="Current Streak" value={stats.currentStreak} icon="🔥" />
          <StatsCard label="Next 24h Matches" value={matches.length} icon="⚡" />
        </div>

        {/* Upcoming Matches */}
        <h2 className="text-3xl font-bold text-psl-yellow mb-6">⚡ Predict Now - Next 24 Hours</h2>
        
        {matches.length === 0 ? (
          <div className="glass rounded-lg p-12 text-center glow-red">
            <p className="text-gray-300 text-2xl mb-2">✅ All caught up!</p>
            <p className="text-gray-500">No matches in the next 24 hours</p>
            <a href="/matches" className="inline-block mt-4 text-psl-yellow hover:text-psl-red transition">
              View full schedule →
            </a>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              {matches.map(match => {
                const pred = predictions.find(p => p.match_id === match.match_id)
                return (
                  <MatchCard
                    key={match.match_id}
                    match={match}
                    userPrediction={pred?.predicted_team}
                    editCount={pred?.edit_count || 0}
                    onPredict={(team) => handlePredict(match.match_id, team)}
                  />
                )
              })}
            </div>
            
            <div className="text-center">
              <a 
                href="/matches" 
                className="inline-block px-8 py-3 glass rounded-lg text-psl-yellow hover:glow-yellow transition font-semibold"
              >
                View All {getAllMatchesWithStatus().length} Matches →
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
