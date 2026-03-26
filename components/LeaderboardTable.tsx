'use client'

import { LeaderboardEntry } from '@/lib/leaderboard'

type LeaderboardTableProps = {
  entries: LeaderboardEntry[]
  currentUserId?: string
}

export default function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  return (
    <div className="glass rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-psl-red/20 border-b border-psl-red/30">
          <tr>
            <th className="px-6 py-4 text-left text-psl-yellow">Rank</th>
            <th className="px-6 py-4 text-left text-psl-yellow">Player</th>
            <th className="px-6 py-4 text-center text-psl-yellow">Points</th>
            <th className="px-6 py-4 text-center text-psl-yellow">Streak</th>
            <th className="px-6 py-4 text-center text-psl-yellow">Best</th>
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
              <td className="px-6 py-4 font-bold text-psl-yellow">{entry.rank}</td>
              <td className="px-6 py-4 font-semibold">{entry.name}</td>
              <td className="px-6 py-4 text-center font-semibold">{entry.total_points}</td>
              <td className="px-6 py-4 text-center">
                {entry.current_streak > 0 ? `🔥 ${entry.current_streak}` : '-'}
              </td>
              <td className="px-6 py-4 text-center text-gray-400">{entry.max_streak}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
