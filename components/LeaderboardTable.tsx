'use client'

import { LeaderboardEntry } from '@/lib/leaderboard'

type LeaderboardTableProps = {
  entries: LeaderboardEntry[]
  currentUserId?: string
}

export default function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  const getTrophyIcon = (rank: number) => {
    if (rank === 1) return <span className="trophy-glow text-2xl">🥇</span>
    if (rank === 2) return <span className="trophy-glow text-2xl">🥈</span>
    return null
  }

  return (
    <div className="glass rounded-2xl overflow-hidden overflow-x-auto depth-shadow">
      <table className="w-full min-w-[500px]">
        <thead className="bg-gradient-to-r from-psl-red/30 to-red-900/30 border-b border-psl-red/40">
          <tr>
            <th className="px-3 sm:px-6 py-4 text-left text-psl-yellow text-sm sm:text-base font-bold">Rank</th>
            <th className="px-3 sm:px-6 py-4 text-left text-psl-yellow text-sm sm:text-base font-bold">Player</th>
            <th className="px-3 sm:px-6 py-4 text-center text-psl-yellow text-sm sm:text-base font-bold">Points</th>
            <th className="px-3 sm:px-6 py-4 text-center text-psl-yellow text-sm sm:text-base font-bold">Streak</th>
            <th className="px-3 sm:px-6 py-4 text-center text-psl-yellow text-sm sm:text-base font-bold">Best</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => {
            const isCurrentUser = entry.user_id === currentUserId
            const trophy = getTrophyIcon(entry.rank)
            
            return (
              <tr
                key={entry.user_id}
                className={`border-b border-gray-800/50 transition-all duration-300 ${
                  isCurrentUser
                    ? 'bg-gradient-to-r from-psl-yellow/20 to-amber-600/20 shadow-lg shadow-psl-yellow/20'
                    : 'hover:bg-white/5'
                }`}
              >
                <td className="px-3 sm:px-6 py-4">
                  <div className="flex items-center gap-2">
                    {trophy || <span className="font-bold text-psl-yellow text-sm sm:text-base">{entry.rank}</span>}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm sm:text-base">{entry.name}</span>
                    {isCurrentUser && (
                      <span className="you-badge">YOU</span>
                    )}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-4 text-center">
                  <span className="font-bold text-psl-yellow text-sm sm:text-base">{entry.total_points}</span>
                </td>
                <td className="px-3 sm:px-6 py-4 text-center text-sm sm:text-base">
                  {entry.current_streak > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-900/30 border border-orange-500/50">
                      🔥 <span className="font-bold">{entry.current_streak}</span>
                    </span>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="px-3 sm:px-6 py-4 text-center text-gray-400 text-sm sm:text-base font-semibold">
                  {entry.max_streak}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
