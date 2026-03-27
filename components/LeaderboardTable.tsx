'use client'

import { LeaderboardEntry } from '@/lib/leaderboard'

type LeaderboardTableProps = {
  entries: LeaderboardEntry[]
  currentUserId?: string
}

export default function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  return (
    <div className="glass rounded-lg overflow-hidden overflow-x-auto">
      <table className="w-full min-w-[500px]">
        <thead className="bg-psl-red/20 border-b border-psl-red/30">
          <tr>
            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-psl-yellow text-sm sm:text-base">Rank</th>
            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-psl-yellow text-sm sm:text-base">Player</th>
            <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-psl-yellow text-sm sm:text-base">Points</th>
            <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-psl-yellow text-sm sm:text-base">Streak</th>
            <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-psl-yellow text-sm sm:text-base">Best</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr
              key={entry.user_id}
              className={`border-b border-gray-800 transition ${
                entry.user_id === currentUserId
                  ? 'bg-psl-yellow/10 glow-yellow'
                  : 'hover:bg-white/5'
              }`}
            >
              <td className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-psl-yellow text-sm sm:text-base">{entry.rank}</td>
              <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-sm sm:text-base">{entry.name}</td>
              <td className="px-3 sm:px-6 py-3 sm:py-4 text-center font-semibold text-sm sm:text-base">{entry.total_points}</td>
              <td className="px-3 sm:px-6 py-3 sm:py-4 text-center text-sm sm:text-base">
                {entry.current_streak > 0 ? `🔥 ${entry.current_streak}` : '-'}
              </td>
              <td className="px-3 sm:px-6 py-3 sm:py-4 text-center text-gray-400 text-sm sm:text-base">{entry.max_streak}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
