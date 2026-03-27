'use client'

import { useState, useEffect } from 'react'
import { MatchWithStatus } from '@/lib/matches'

type MatchCardProps = {
  match: MatchWithStatus
  userPrediction?: string | null
  editCount?: number
  onPredict: (team: string) => Promise<void>
}

export default function MatchCard({ match, userPrediction, editCount = 0, onPredict }: MatchCardProps) {
  const [timeLeft, setTimeLeft] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const updateTimer = () => {
      const ms = match.time_until_lock
      if (ms <= 0) {
        setTimeLeft('CLOSED')
        return
      }

      const totalMinutes = Math.floor(ms / (1000 * 60))
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`)
      } else {
        setTimeLeft(`${minutes}m`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [match.time_until_lock])

  const handlePredict = async (team: string) => {
    setLoading(true)
    try {
      await onPredict(team)
    } finally {
      setLoading(false)
    }
  }

  const canEdit = match.prediction_open && editCount < 2

  return (
    <div className="glass rounded-xl p-3 sm:p-6 hover:glow-yellow transition-all duration-300">
      <div className="flex flex-col gap-3 mb-3">
        {/* Match Header */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-psl-yellow uppercase tracking-wide font-bold mb-1">
              {match.match_id.replace('psl2026_', 'Match ')}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(match.match_datetime).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })} • {new Date(match.match_datetime).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
          
          {/* Timer Badge */}
          {match.prediction_open && (
            <div className="bg-green-900/70 text-green-300 border border-green-500 animate-pulse text-xs font-bold px-2 py-1 rounded-md">
              ⏰ {timeLeft}
            </div>
          )}
          {match.prediction_closed && (
            <div className="bg-red-900/70 text-red-300 border border-red-500 text-xs font-bold px-2 py-1 rounded-md">
              🔒 CLOSED
            </div>
          )}
        </div>

        {/* Result if available */}
        {match.result && (
          <div className="bg-psl-yellow/10 border border-psl-yellow/30 rounded-lg p-2">
            <p className="text-xs text-psl-yellow font-semibold text-center">
              ✅ Winner: {match.result}
            </p>
          </div>
        )}
      </div>

      {/* Teams */}
      <div className="space-y-2 mb-3">
        <button
          onClick={() => handlePredict(match.team1)}
          disabled={!canEdit || loading}
          className={`w-full py-3 px-4 rounded-lg font-bold text-sm transition-all ${
            userPrediction === match.team1 
              ? 'bg-gradient-to-r from-psl-yellow to-amber-500 text-black shadow-lg shadow-psl-yellow/50 scale-[1.02]' 
              : 'bg-white/5 text-white hover:bg-white/10 border border-gray-700'
          } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {match.team1}
        </button>
        
        <div className="text-center">
          <span className="text-psl-yellow font-bold text-lg">VS</span>
        </div>
        
        <button
          onClick={() => handlePredict(match.team2)}
          disabled={!canEdit || loading}
          className={`w-full py-3 px-4 rounded-lg font-bold text-sm transition-all ${
            userPrediction === match.team2 
              ? 'bg-gradient-to-r from-psl-yellow to-amber-500 text-black shadow-lg shadow-psl-yellow/50 scale-[1.02]' 
              : 'bg-white/5 text-white hover:bg-white/10 border border-gray-700'
          } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {match.team2}
        </button>
      </div>

      {/* Status Footer */}
      {userPrediction && (
        <div className="flex justify-between items-center text-xs bg-black/30 rounded-lg p-2">
          <span className="text-gray-400">Your pick: <span className="text-psl-yellow font-bold">{userPrediction}</span></span>
          <span className="text-gray-500">Edits: {editCount}/2</span>
        </div>
      )}

      {match.prediction_closed && !userPrediction && !match.result && (
        <div className="text-center text-xs text-red-400 bg-red-900/20 py-2 rounded-lg border border-red-900/50">
          ⚠️ Missed prediction
        </div>
      )}
    </div>
  )
}
