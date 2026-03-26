'use client'

export default function FloatingBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="floating-orb orb-1"></div>
      <div className="floating-orb orb-2"></div>
      <div className="floating-orb orb-3"></div>
      <div className="cricket-ball ball-1">🏏</div>
      <div className="cricket-ball ball-2">🏏</div>
    </div>
  )
}
