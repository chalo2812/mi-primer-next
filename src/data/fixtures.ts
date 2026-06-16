export type Match = {
  date: string
  datetime?: string // ISO datetime with timezone when available
  teamA: string
  teamB: string
  scoreA?: number | null
  scoreB?: number | null
  played: boolean
}

export type Group = {
  name: string
  matches: Match[]
}

export const groups: Group[] = [
  {
    name: 'Grupo A',
    matches: [
      { date: '2026-06-11', teamA: 'Canada', teamB: 'Morocco', scoreA: 2, scoreB: 0, played: true },
      { date: '2026-06-15', teamA: 'Mexico', teamB: 'Canada', played: false },
      { date: '2026-06-19', teamA: 'Morocco', teamB: 'Mexico', played: false },
    ],
  },
  {
    name: 'Grupo B',
    matches: [
      { date: '2026-06-12', teamA: 'USA', teamB: 'Wales', scoreA: 1, scoreB: 1, played: true },
      { date: '2026-06-16', teamA: 'Iran', teamB: 'USA', played: false },
      { date: '2026-06-20', teamA: 'Wales', teamB: 'Iran', played: false },
    ],
  },
  {
    name: 'Grupo C',
    matches: [
      { date: '2026-06-13', datetime: '2026-06-13T20:00:00-03:00', teamA: 'Argentina', teamB: 'Algeria', played: false },
      { date: '2026-06-17', datetime: '2026-06-17T18:00:00-03:00', teamA: 'Argentina', teamB: 'Australia', played: false },
      { date: '2026-06-21', datetime: '2026-06-21T20:00:00-03:00', teamA: 'Uruguay', teamB: 'Argentina', played: false },
    ],
  },
]
