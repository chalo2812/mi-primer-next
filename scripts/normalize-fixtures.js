#!/usr/bin/env node
const fs = require('fs')

const RAW = 'scripts/fixtures_raw.json'
if (!fs.existsSync(RAW)) {
  console.error('No existe', RAW)
  process.exit(1)
}

const raw = JSON.parse(fs.readFileSync(RAW, 'utf8'))
const results = raw.Results || raw.Matches || raw.results || raw
if (!results || !results.length) {
  console.error('No hay resultados en el JSON crudo')
  process.exit(1)
}

const nameMap = {
  'Estados Unidos': 'United States',
  'EEUU': 'United States',
  'USA': 'United States',
  'United States of America': 'United States',
  'Gales': 'Wales',
  'Argelia': 'Algeria',
  'España': 'Spain',
  'Reino Unido': 'United Kingdom',
  'Corea del Sur': 'South Korea',
  'C?te d\'Ivoire': 'Ivory Coast',
}

function mapName(n) {
  if (!n) return 'TBD'
  n = n.trim()
  if (nameMap[n]) return nameMap[n]
  // simple cleanups
  const replacements = {
    ' Gambia': 'Gambia'
  }
  if (replacements[n]) return replacements[n]
  // capitalize first letter of each word
  return n
}

function extractTeamName(teamObj) {
  if (!teamObj) return null
  if (teamObj.TeamName && teamObj.TeamName[0] && teamObj.TeamName[0].Description) return teamObj.TeamName[0].Description
  if (teamObj.ShortClubName) return teamObj.ShortClubName
  if (teamObj.Abbreviation) return teamObj.Abbreviation
  return null
}

const items = []
for (const r of results) {
  const comp = ((r.CompetitionName && r.CompetitionName[0] && r.CompetitionName[0].Description) || '').toString().toLowerCase()
  const season = ((r.SeasonName && r.SeasonName[0] && r.SeasonName[0].Description) || '').toString().toLowerCase()

  if (!(comp.includes('mundial') || comp.includes('world cup') || season.includes('2026') || season.includes('2026'))) {
    continue
  }

  const date = r.Date || r.LocalDate || null
  const teamA = mapName(extractTeamName(r.Home) || r.Home?.Abbreviation || r.PlaceHolderA)
  const teamB = mapName(extractTeamName(r.Away) || r.Away?.Abbreviation || r.PlaceHolderB)
  const scoreA = r.HomeTeamScore != null ? r.HomeTeamScore : (r.Home && r.Home.Score != null ? r.Home.Score : null)
  const scoreB = r.AwayTeamScore != null ? r.AwayTeamScore : (r.Away && r.Away.Score != null ? r.Away.Score : null)

  items.push({ date: date ? date.split('T')[0] : null, datetime: date || null, teamA, teamB, scoreA: scoreA == null ? null : Number(scoreA), scoreB: scoreB == null ? null : Number(scoreB), played: Boolean(scoreA != null || scoreB != null) })
}

// keep only matches with date in 2026
const items2026 = items.filter((it) => it.date && it.date.startsWith('2026-'))
if (!items2026.length) {
  console.error('No se encontraron partidos 2026 tras filtrar por fecha. Restaurando backup si existe y abortando.')
  try {
    if (fs.existsSync('src/data/fixtures.backup.from_normalize.ts')) fs.copyFileSync('src/data/fixtures.backup.from_normalize.ts', 'src/data/fixtures.ts')
  } catch (e) { console.warn('No pude restaurar backup:', e.message) }
  process.exit(1)
}

const itemsFinal = items2026

// backup
try { if (fs.existsSync('src/data/fixtures.ts')) fs.copyFileSync('src/data/fixtures.ts', 'src/data/fixtures.backup.from_normalize.ts') } catch(e) { console.warn('No pude crear backup:', e.message) }

const output = `export type Match = {\n  date: string\n  datetime?: string // ISO datetime with timezone when available\n  teamA: string\n  teamB: string\n  scoreA?: number | null\n  scoreB?: number | null\n  played: boolean\n}\n\nexport type Group = {\n  name: string\n  matches: Match[]\n}\n\nexport const groups: Group[] = ${JSON.stringify([{ name: 'FIFA World Cup 2026', matches: itemsFinal }], null, 2)}\n`

fs.writeFileSync('src/data/fixtures.ts', output, 'utf8')
console.log('Escribí src/data/fixtures.ts con', itemsFinal.length, 'partidos')
