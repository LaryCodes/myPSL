'use client'

type StatsCardProps = {
  label: string
  value: number | string
  icon?: string
}

export default function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <div className="stats-card hover:scale-105 cursor-default">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2 font-semibold">{label}</p>
          <p className="stats-number text-4xl">{value}</p>
        </div>
        {icon && <span className="text-5xl opacity-60 animate-pulse">{icon}</span>}
      </div>
    </div>
  )
}
