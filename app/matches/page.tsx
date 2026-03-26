'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getAllMatchesWithStatus, MatchWithStatus } from '@/lib/matches'
import MatchCard from '@/components/MatchCard'
import Navbar from '@/components/Navbar'
import FloatingBackground from '@/components/FloatingBackground'

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
        <h1 className="text-4xl font-bold text-psl-yellow mb-8">Complete Schedule</h1>
        
        <div className="space-y-6">
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
    </div>
  )
}
