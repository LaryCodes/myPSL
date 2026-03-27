'use client'

type StatsCardProps = {
  label: string
  value: number | string
  icon?: string
}

export default function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <div className="stats-card">
      <div className="flex flex-col items-center text-center gap-1">
        {icon && <span className="text-2xl sm:text-3xl opacity-80">{icon}</span>}
        <p className="stats-number">{value}</p>
        <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wide font-semibold">{label}</p>
      </div>
    </div>
  )
}
