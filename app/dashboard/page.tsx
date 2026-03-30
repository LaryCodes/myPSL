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
  accuracy: number
}

export default function DashboardPage() {
  const [matches, setMatches] = useState<MatchWithStatus[]>([])
  const [predictions, setPredictions] = useState<UserPrediction[]>([])
  const [stats, setStats] = useState<UserStats>({ totalPredictions: 0, correctPredictions: 0, currentStreak: 0, points: 0, accuracy: 0 })
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    // Ensure cookie is set
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=3600`
      }
    })
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
      
      // Calculate accuracy from completed matches
      const allMatches = getAllMatchesWithStatus()
      const completedMatches = allMatches.filter(m => m.result && m.result !== 'no_result')
      
      let correctCount = 0
      completedMatches.forEach(match => {
        const prediction = userPredictions.find((p: UserPrediction) => p.match_id === match.match_id)
        if (prediction && prediction.predicted_team === match.result) {
          correctCount++
        }
      })
      
      const predictedCompletedMatches = userPredictions.filter((p: UserPrediction) => {
        const match = completedMatches.find(m => m.match_id === p.match_id)
        return match !== undefined
      }).length
      
      const accuracy = predictedCompletedMatches > 0 
        ? Math.round((correctCount / predictedCompletedMatches) * 100) 
        : 0
      
      // Calculate quick stats
      const leaderboardRes = await fetch('/api/leaderboard')
      const leaderboard = await leaderboardRes.json()
      const userEntry = leaderboard.find((e: any) => e.user_id === user.id)
      
      if (userEntry) {
        setStats({
          totalPredictions: userPredictions.length,
          correctPredictions: correctCount,
          currentStreak: userEntry.current_streak,
          points: userEntry.total_points,
          accuracy: accuracy
        })
      }
    }

    setLoading(false)
  }

  const handlePredict = async (matchId: string, team: string) => {
    try {
      // Get fresh session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert('Please login again')
        return
      }

      const existing = predictions.find(p => p.match_id === matchId)
      const endpoint = existing ? '/api/predictions/update' : '/api/predictions'
      const method = existing ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'include',
        body: JSON.stringify({ match_id: matchId, predicted_team: team })
      })

      if (response.ok) {
        await loadData()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save prediction')
      }
    } catch (err: any) {
      alert('Error: ' + err.message)
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
      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-8">
        {/* Hero Section with 3D Effect */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-6xl font-black mb-3 gradient-text drop-shadow-2xl">
            Dashboard
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">Predict. Compete. Conquer.</p>
        </div>

        {/* Stats Grid with 3D Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <StatsCard label="Points" value={stats.points} icon="🏆" />
          <StatsCard label="Accuracy" value={stats.accuracy} icon="🎯" isAccuracy={true} />
          <StatsCard label="Streak" value={stats.currentStreak} icon="🔥" />
          <StatsCard label="Upcoming" value={matches.length} icon="⚡" />
        </div>

        {/* Upcoming Matches Section */}
        <div className="glass rounded-2xl p-4 sm:p-6 depth-shadow mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-psl-yellow mb-4 flex items-center gap-2">
            <span className="neon-text">⚡ Predict Now</span>
            <span className="text-sm text-gray-500 font-normal">(Next 24h)</span>
          </h2>
          
          {matches.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-gray-300 text-lg sm:text-xl font-semibold mb-2">All caught up!</p>
              <p className="text-gray-500 text-sm mb-6">No matches in the next 24 hours</p>
              <a 
                href="/matches" 
                className="inline-block px-6 py-3 bg-gradient-to-r from-psl-red to-red-700 text-white rounded-full font-bold hover:shadow-lg hover:shadow-psl-red/50 transition-all duration-300 hover:scale-105"
              >
                View Full Schedule →
              </a>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
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
                  className="inline-block px-6 py-3 glass rounded-xl text-psl-yellow hover:glow-yellow transition-all duration-300 font-bold text-sm sm:text-base hover:scale-105"
                >
                  View All Matches →
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
