'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import FloatingBackground from '@/components/FloatingBackground'
import BottomNav from '@/components/BottomNav'

type UltimatePrediction = {
  finalist_team1: string
  finalist_team2: string
  champion_team: string | null
}

const ALL_TEAMS = [
  'Islamabad United',
  'Karachi Kings',
  'Lahore Qalandars',
  'Multan Sultans',
  'Peshawar Zalmi',
  'Quetta Gladiators',
  'Rawalpindi',
  'Hyderabad Kingsmen'
]

export default function UltimateCallPage() {
  const [prediction, setPrediction] = useState<UltimatePrediction>({
    finalist_team1: '',
    finalist_team2: '',
    champion_team: null
  })
  const [existingPrediction, setExistingPrediction] = useState<any>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [timeLeft, setTimeLeft] = useState('Loading...')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lockTimeMs, setLockTimeMs] = useState<number>(0)

  useEffect(() => {
    loadData()
    // Ensure cookie is set
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=3600`
      }
    })
  }, [])

  useEffect(() => {
    if (lockTimeMs <= 0) return

    const updateTimer = () => {
      setLockTimeMs(prev => {
        const newTime = Math.max(0, prev - 1000)
        
        if (newTime <= 0) {
          setTimeLeft('LOCKED')
          setIsLocked(true)
          return 0
        }

        const days = Math.floor(newTime / (1000 * 60 * 60 * 24))
        const hours = Math.floor((newTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((newTime % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((newTime % (1000 * 60)) / 1000)

        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`)
        return newTime
      })
    }

    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [lockTimeMs])

  const loadData = async () => {
    try {
      const response = await fetch('/api/ultimate-call')
      
      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText)
        const errorData = await response.json()
        console.error('Error details:', errorData)
        setLoading(false)
        return
      }
      
      const data = await response.json()
      console.log('API Response:', data)
      
      setIsLocked(data.isLocked)
      setLockTimeMs(data.timeUntilLock || 0)
      
      if (data.prediction) {
        setExistingPrediction(data.prediction)
        setPrediction({
          finalist_team1: data.prediction.finalist_team1,
          finalist_team2: data.prediction.finalist_team2,
          champion_team: data.prediction.champion_team
        })
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Failed to load:', error)
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!prediction.finalist_team1 || !prediction.finalist_team2) {
      alert('Please select both finalist teams')
      return
    }

    if (prediction.finalist_team1 === prediction.finalist_team2) {
      alert('Finalist teams must be different')
      return
    }

    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert('Please login again')
        return
      }

      // Ensure cookie is set
      document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=3600`

      const response = await fetch('/api/ultimate-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'include',
        body: JSON.stringify(prediction)
      })

      if (response.ok) {
        await loadData()
        alert('✅ Ultimate Call saved successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save')
      }
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const availableChampions = [prediction.finalist_team1, prediction.finalist_team2].filter(t => t)

  if (loading) {
    return (
      <div className="min-h-screen">
        <FloatingBackground />
        <Navbar />
        <div className="relative z-10 max-w-5xl mx-auto p-8 text-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <FloatingBackground />
      <Navbar />
      
      <div className="relative z-10 max-w-5xl mx-auto p-4 sm:p-8">
        {/* Premium Hero Section */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-block mb-3">
            <span className="text-4xl sm:text-6xl md:text-8xl">🏆</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black mb-2 sm:mb-4 gradient-text drop-shadow-2xl">
            ULTIMATE CALL
          </h1>
          <p className="text-gray-400 text-xs sm:text-base md:text-lg mb-4 sm:mb-6 px-4">
            High-Stakes Predictions • Maximum Rewards
          </p>
          
          {/* Big Countdown Timer */}
          <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 depth-shadow max-w-2xl mx-auto">
            {isLocked ? (
              <div className="text-center">
                <p className="text-red-400 text-xl sm:text-2xl md:text-3xl font-black mb-2">🔒 LOCKED</p>
                <p className="text-gray-500 text-xs sm:text-sm">Predictions are closed</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-400 text-xs sm:text-sm uppercase tracking-wide mb-2 sm:mb-3">Time Remaining</p>
                <p className="text-2xl sm:text-4xl md:text-6xl font-black gradient-text neon-text">
                  {timeLeft}
                </p>
                <p className="text-gray-500 text-xs sm:text-sm mt-2 sm:mt-3">Until Qualifier 1</p>
              </div>
            )}
          </div>
        </div>

        {/* Finals Prediction Card */}
        <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 depth-shadow border-2 border-psl-yellow/30 hover:border-psl-yellow/50 transition-colors">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <span className="text-2xl sm:text-3xl md:text-4xl">🎯</span>
            <div>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-psl-yellow neon-text">
                Finals Prediction
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm">Pick 2 teams to reach the final</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-300 mb-2">Finalist 1</label>
              <select
                value={prediction.finalist_team1}
                onChange={(e) => setPrediction({ ...prediction, finalist_team1: e.target.value })}
                disabled={isLocked}
                className="w-full bg-black/50 border border-gray-700 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-white font-semibold focus:border-psl-yellow focus:outline-none disabled:opacity-50"
              >
                <option value="">Select Team</option>
                {ALL_TEAMS.filter(team => team !== prediction.finalist_team2).map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-300 mb-2">Finalist 2</label>
              <select
                value={prediction.finalist_team2}
                onChange={(e) => setPrediction({ ...prediction, finalist_team2: e.target.value })}
                disabled={isLocked}
                className="w-full bg-black/50 border border-gray-700 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-white font-semibold focus:border-psl-yellow focus:outline-none disabled:opacity-50"
              >
                <option value="">Select Team</option>
                {ALL_TEAMS.filter(team => team !== prediction.finalist_team1).map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/50 rounded-xl p-3 sm:p-4">
            <p className="text-green-400 font-bold text-center text-xs sm:text-base">
              💰 Rewards: <span className="text-lg sm:text-2xl">+7</span> points (one correct) • <span className="text-lg sm:text-2xl">+15</span> points (both correct)
            </p>
          </div>
        </div>

        {/* Champion Prediction Card */}
        <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 depth-shadow border-2 border-amber-500/30 hover:border-amber-500/50 transition-colors">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <span className="text-2xl sm:text-3xl md:text-4xl">👑</span>
            <div>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-amber-400 neon-text">
                Champion Prediction
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm">Pick the tournament winner from your finalists</p>
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-bold text-gray-300 mb-2">Champion</label>
            <select
              value={prediction.champion_team || ''}
              onChange={(e) => setPrediction({ ...prediction, champion_team: e.target.value || null })}
              disabled={isLocked || availableChampions.length === 0}
              className="w-full bg-black/50 border border-gray-700 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-white font-semibold focus:border-amber-400 focus:outline-none disabled:opacity-50"
            >
              <option value="">Select Champion</option>
              {availableChampions.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
            {availableChampions.length === 0 && (
              <p className="text-gray-500 text-xs mt-2">Select your finalists first</p>
            )}
          </div>

          <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border border-amber-500/50 rounded-xl p-3 sm:p-4">
            <p className="text-amber-400 font-bold text-center text-xs sm:text-base">
              💰 Reward: <span className="text-xl sm:text-3xl">+10</span> points (if correct)
            </p>
          </div>
        </div>

        {/* Save Button */}
        {!isLocked && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full btn-primary py-3 sm:py-4 text-base sm:text-lg md:text-xl mb-20 sm:mb-0"
          >
            {saving ? 'Saving...' : existingPrediction ? '✏️ Update Ultimate Call' : '🚀 Submit Ultimate Call'}
          </button>
        )}

        {/* Info Section */}
        <div className="mt-6 sm:mt-8 glass rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center mb-20 sm:mb-0">
          <p className="text-gray-400 text-xs sm:text-sm">
            ℹ️ You can edit your predictions unlimited times until the lock time
          </p>
        </div>
      </div>
      
      <BottomNav />
    </div>
  )
}
