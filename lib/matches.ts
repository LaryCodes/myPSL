import matchesData from '@/data/matches.json'

export type Match = {
  match_id: string
  team1: string
  team2: string
  match_datetime: string
  result: string | null
}

export type MatchWithStatus = Match & {
  prediction_open: boolean
  prediction_closed: boolean
  time_until_lock: number
}

const LOCK_MINUTES = 10
const WINDOW_HOURS = 24

export function getMatches(): Match[] {
  return matchesData as Match[]
}

export function getMatchWithStatus(matchId: string): MatchWithStatus | null {
  const match = matchesData.find((m: any) => m.match_id === matchId)
  if (!match) return null

  const now = new Date()
  const matchTime = new Date(match.match_datetime)
  const windowOpenTime = new Date(matchTime.getTime() - WINDOW_HOURS * 60 * 60 * 1000)
  const windowCloseTime = new Date(matchTime.getTime() - LOCK_MINUTES * 60 * 1000)
  
  const timeUntilClose = windowCloseTime.getTime() - now.getTime()
  const predictionOpen = now >= windowOpenTime && now < windowCloseTime
  const predictionClosed = now >= windowCloseTime

  return {
    ...match,
    prediction_open: predictionOpen,
    prediction_closed: predictionClosed,
    time_until_lock: Math.max(0, timeUntilClose)
  }
}

export function getAllMatchesWithStatus(): MatchWithStatus[] {
  return matchesData.map((match: any) => {
    const now = new Date()
    const matchTime = new Date(match.match_datetime)
    const windowOpenTime = new Date(matchTime.getTime() - WINDOW_HOURS * 60 * 60 * 1000)
    const windowCloseTime = new Date(matchTime.getTime() - LOCK_MINUTES * 60 * 1000)
    
    const timeUntilClose = windowCloseTime.getTime() - now.getTime()
    const predictionOpen = now >= windowOpenTime && now < windowCloseTime
    const predictionClosed = now >= windowCloseTime

    return {
      ...match,
      prediction_open: predictionOpen,
      prediction_closed: predictionClosed,
      time_until_lock: Math.max(0, timeUntilClose)
    }
  })
}
