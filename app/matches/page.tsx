'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getAllMatchesWithStatus, MatchWithStatus } from '@/lib/matches'
import MatchCard from '@/components/MatchCard'
import Navbar from '@/components/Navbar'
import FloatingBackground from '@/components/FloatingBackground'
import BottomNav from '@/components/BottomNav'

type UserPrediction = {
  match_id: string
  predicted_team: string
  edit_count: number
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchWithStatus[]>([])
  const [predictions, setPredictions] = useState<UserPrediction[]>([])
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
    const allMatches = getAllMatchesWithStatus()
    setMatches(allMatches)

    const { data: userPredictions } = await supabase
      .from('predictions')
      .select('match_id, predicted_team, edit_count')
      .eq('user_id', user.id)
      .eq('is_final', true)

    if (userPredictions) {
      setPredictions(userPredictions)
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
    <div className="min-h-screen pb-20 md:pb-0">
      <FloatingBackground />
      <Navbar />
      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-8">
        {/* Hero Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-6xl font-black mb-3 gradient-text drop-shadow-2xl">
            All Matches
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">Complete PSL 2026 Schedule</p>
        </div>
        
        <div className="space-y-4">
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
      </div>
      
      <BottomNav />
    </div>
  )
}
