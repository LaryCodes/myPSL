'use client'

type StatsCardProps = {
  label: string
  value: number | string
  icon?: string
  isAccuracy?: boolean
}

export default function StatsCard({ label, value, icon, isAccuracy = false }: StatsCardProps) {
  // Color coding for accuracy
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 70) return 'from-green-500 to-emerald-600' // High - Green
    if (accuracy >= 50) return 'from-yellow-500 to-amber-600' // Medium - Yellow
    return 'from-red-500 to-rose-600' // Low - Red
  }

  const getAccuracyGlow = (accuracy: number) => {
    if (accuracy >= 70) return 'shadow-green-500/50'
    if (accuracy >= 50) return 'shadow-yellow-500/50'
    return 'shadow-red-500/50'
  }

  const numValue = typeof value === 'string' ? parseInt(value) : value
  const accuracyColor = isAccuracy ? getAccuracyColor(numValue) : ''
  const accuracyGlow = isAccuracy ? getAccuracyGlow(numValue) : ''

  return (
    <div className="stats-card">
      <div className="flex flex-col items-center text-center gap-1">
        {icon && <span className="text-2xl sm:text-3xl opacity-80">{icon}</span>}
        {isAccuracy ? (
          <p className={`text-3xl sm:text-4xl font-black bg-gradient-to-r ${accuracyColor} bg-clip-text text-transparent drop-shadow-lg`}>
            {value}%
          </p>
        ) : (
          <p className="stats-number">{value}</p>
        )}
        <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wide font-semibold">{label}</p>
      </div>
    </div>
  )
}
