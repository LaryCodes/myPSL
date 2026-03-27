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
    <div className="glass rounded-xl p-6 hover:glow-yellow transition-all duration-300 transform hover:scale-105">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs text-psl-yellow uppercase tracking-wide mb-1 font-bold">
            {match.match_id.replace('psl2026_', 'Match ')}
          </p>
          <p className="text-sm text-gray-300 flex items-center gap-2">
            📅 {new Date(match.match_datetime).toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
          <p className="text-sm text-gray-300 flex items-center gap-2">
            🕐 {new Date(match.match_datetime).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
          {match.result && (
            <p className="text-sm text-psl-yellow mt-2 font-semibold flex items-center gap-1">
              ✅ Winner: {match.result}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className={`text-xs font-bold px-3 py-2 rounded-lg ${
            match.prediction_closed 
              ? 'bg-red-900/70 text-red-300 border border-red-500' 
              : 'bg-green-900/70 text-green-300 border border-green-500 animate-pulse'
          }`}>
            {match.prediction_closed ? '🔒 CLOSED' : `⏰ ${timeLeft}`}
          </div>
          {userPrediction && (
            <p className="text-xs text-gray-400 mt-2 bg-black/30 px-2 py-1 rounded">
              Edits: {editCount}/2
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-4 items-center justify-center my-6">
        <button
          onClick={() => handlePredict(match.team1)}
          disabled={!canEdit || loading}
          className={`btn-primary flex-1 text-base font-bold ${
            userPrediction === match.team1 ? 'glow-yellow ring-2 ring-psl-yellow scale-105' : ''
          }`}
        >
          {match.team1}
        </button>
        <span className="text-psl-yellow font-bold text-3xl drop-shadow-lg">VS</span>
        <button
          onClick={() => handlePredict(match.team2)}
          disabled={!canEdit || loading}
          className={`btn-primary flex-1 text-base font-bold ${
            userPrediction === match.team2 ? 'glow-yellow ring-2 ring-psl-yellow scale-105' : ''
          }`}
        >
          {match.team2}
        </button>
      </div>

      {userPrediction && (
        <div className="text-center p-3 bg-gradient-to-r from-psl-yellow/20 to-psl-red/20 rounded-lg border border-psl-yellow/40 backdrop-blur-sm">
          <p className="text-sm text-gray-200">
            Your pick: <span className="text-psl-yellow font-bold text-lg">{userPrediction}</span>
          </p>
        </div>
      )}

      {match.prediction_closed && !userPrediction && (
        <p className="text-center text-sm text-red-400 mt-2 bg-red-900/30 py-2 rounded">
          ⚠️ You missed this prediction
        </p>
      )}
    </div>
  )
}
