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
    <div className="glass card-3d rounded-2xl p-4 sm:p-6 depth-shadow">
      <div className="flex flex-col gap-3 mb-4">
        {/* Match Header */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs sm:text-sm text-psl-yellow uppercase tracking-wide font-bold mb-1 neon-text">
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
            <div className="bg-gradient-to-r from-green-900/80 to-emerald-900/80 text-green-300 border border-green-500/60 animate-pulse text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg shadow-green-500/30">
              ⏰ {timeLeft}
            </div>
          )}
          {match.prediction_closed && (
            <div className="bg-gradient-to-r from-red-900/80 to-rose-900/80 text-red-300 border border-red-500/60 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg shadow-red-500/30">
              🔒 CLOSED
            </div>
          )}
        </div>

        {/* Result if available */}
        {match.result && (
          <div className="bg-gradient-to-r from-psl-yellow/20 to-amber-600/20 border border-psl-yellow/40 rounded-xl p-3 backdrop-blur-sm">
            <p className="text-xs sm:text-sm text-psl-yellow font-bold text-center neon-text">
              ✅ Winner: {match.result}
            </p>
          </div>
        )}
      </div>

      {/* Teams */}
      <div className="space-y-3 mb-4">
        <button
          onClick={() => handlePredict(match.team1)}
          disabled={!canEdit || loading}
          className={`w-full py-3 sm:py-4 px-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 transform ${
            userPrediction === match.team1 
              ? 'bg-gradient-to-r from-psl-yellow via-amber-500 to-psl-yellow text-black shadow-2xl shadow-psl-yellow/60 scale-[1.03] border-2 border-amber-300' 
              : 'bg-gradient-to-br from-white/10 to-white/5 text-white hover:from-white/15 hover:to-white/10 border border-gray-700/50 hover:border-gray-600 hover:scale-[1.01]'
          } ${!canEdit ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
        >
          {match.team1}
        </button>
        
        <div className="text-center">
          <span className="text-psl-yellow font-black text-xl sm:text-2xl neon-text">VS</span>
        </div>
        
        <button
          onClick={() => handlePredict(match.team2)}
          disabled={!canEdit || loading}
          className={`w-full py-3 sm:py-4 px-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 transform ${
            userPrediction === match.team2 
              ? 'bg-gradient-to-r from-psl-yellow via-amber-500 to-psl-yellow text-black shadow-2xl shadow-psl-yellow/60 scale-[1.03] border-2 border-amber-300' 
              : 'bg-gradient-to-br from-white/10 to-white/5 text-white hover:from-white/15 hover:to-white/10 border border-gray-700/50 hover:border-gray-600 hover:scale-[1.01]'
          } ${!canEdit ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
        >
          {match.team2}
        </button>
      </div>

      {/* Status Footer */}
      {userPrediction && (
        <div className="flex justify-between items-center text-xs bg-gradient-to-r from-black/40 to-black/30 rounded-lg p-3 border border-gray-800/50">
          <span className="text-gray-400">Your pick: <span className="text-psl-yellow font-bold">{userPrediction}</span></span>
          <span className="text-gray-500 font-semibold">Edits: {editCount}/2</span>
        </div>
      )}

      {match.prediction_closed && !userPrediction && !match.result && (
        <div className="text-center text-xs text-red-400 bg-gradient-to-r from-red-900/30 to-rose-900/30 py-2 rounded-lg border border-red-900/60">
          ⚠️ Missed prediction
        </div>
      )}
    </div>
  )
}
