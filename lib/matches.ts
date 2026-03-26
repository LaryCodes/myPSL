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

const LOCK_MINUTES = 50

export function getMatches(): Match[] {
  return matchesData as Match[]
}

export function getMatchWithStatus(matchId: string): MatchWithStatus | null {
  const match = matchesData.find((m: any) => m.match_id === matchId)
  if (!match) return null

  const now = new Date()
  const matchTime = new Date(match.match_datetime)
  const windowOpenTime = new Date(matchTime.getTime() - LOCK_MINUTES * 60 * 1000)
  
  const timeUntilLock = matchTime.getTime() - now.getTime()
  const predictionOpen = now >= windowOpenTime && now < matchTime
  const predictionClosed = now >= matchTime

  return {
    ...match,
    prediction_open: predictionOpen,
    prediction_closed: predictionClosed,
    time_until_lock: Math.max(0, timeUntilLock)
  }
}

export function getAllMatchesWithStatus(): MatchWithStatus[] {
  return matchesData.map((match: any) => {
    const now = new Date()
    const matchTime = new Date(match.match_datetime)
    const windowOpenTime = new Date(matchTime.getTime() - LOCK_MINUTES * 60 * 1000)
    
    const timeUntilLock = matchTime.getTime() - now.getTime()
    const predictionOpen = now >= windowOpenTime && now < matchTime
    const predictionClosed = now >= matchTime

    return {
      ...match,
      prediction_open: predictionOpen,
      prediction_closed: predictionClosed,
      time_until_lock: Math.max(0, timeUntilLock)
    }
  })
}
