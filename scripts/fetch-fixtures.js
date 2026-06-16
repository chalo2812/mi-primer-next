#!/usr/bin/env node
const fs = require('fs')

async function fetchJson(url) {
  console.log('GET', url)
  const res = await fetch(url, { headers: { 'User-Agent': 'node-fetch' } })
  console.log('HTTP', res.status)
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
  const json = await res.json()
  try { fs.writeFileSync('scripts/fixtures_raw.json', JSON.stringify(json, null, 2)) } catch (e) { console.warn('No pude escribir scripts/fixtures_raw.json:', e.message) }
  return json
}

function toMatch(item) {
  const teamA = item.HomeTeam?.TeamName?.[0]?.Description || item.home?.name || item.homeTeam?.name || item.homeTeam?.teamName || item.Home?.TeamName?.[0]?.Description || item.Home?.name || item.homeTeamCountry || item.TeamA || item.teamA || item.homeTeam
  const teamB = item.AwayTeam?.TeamName?.[0]?.Description || item.away?.name || item.awayTeam?.name || item.awayTeam?.teamName || item.Away?.TeamName?.[0]?.Description || item.Away?.name || item.awayTeamCountry || item.TeamB || item.teamB || item.awayTeam
  const date = (item.Date || item.MatchDate || item.matchDate || item.date || item.MatchDateTime || item.dateUtc || item.matchday) || null
  const datetime = item.Date || item.MatchDateTime || item.dateUtc || item.matchDate || item.datetime || item.DateTime
  const played = !!(item.HomeTeam?.Score || item.home?.score || item.result || item.status === 'played' || item.status === 'FT' || item.status === 'finished')
  const scoreA = item.HomeTeam?.Score || item.home?.score || (item.result && item.result.home) || null
  const scoreB = item.AwayTeam?.Score || item.away?.score || (item.result && item.result.away) || null

  return {
    date: date ? date.split('T')[0] : (datetime ? datetime.split('T')[0] : null),
    datetime: datetime || null,
    teamA: teamA || 'TBD',
    teamB: teamB || 'TBD',
    scoreA: scoreA == null ? null : Number(scoreA),
    scoreB: scoreB == null ? null : Number(scoreB),
    played: Boolean(played),
  }
}

async function main() {
  console.log('Intentando obtener fixture desde la API pública de FIFA...')
  try {
    const url = 'https://api.fifa.com/api/v3/calendar/matches?language=es&count=500'
    const data = await fetchJson(url)
    const matches = data.Matches || data.Results || data.matches || data.Match || data
    if (!matches || !matches.length) throw new Error('No hay matches en la respuesta')

    const wcMatches = matches.filter((m) => {
      const comp = (m?.Competition?.Name?.[0]?.Description || m?.CompetitionName || m?.Competition?.Name || m?.competition || m?.stageName || '').toString().toLowerCase()
      return comp.includes('world') || comp.includes('mundial') || comp.includes('world cup') || (m?.Competition?.Id === 17) || m?.season === 2026 || (m?.MatchOrder && m?.MatchOrder.toString().includes('2026'))
    })

    const source = wcMatches.length ? wcMatches : matches
    console.log('Matches recibidos:', matches.length, 'Filtrados para WC26:', source.length)
    let items = source.map(toMatch)
    // keep only matches in year 2026 (reduce noise/historical matches)
    items = items.filter((it) => it.date && it.date.startsWith('2026-'))

    const output = `export type Match = {\n  date: string\n  datetime?: string // ISO datetime with timezone when available\n  teamA: string\n  teamB: string\n  scoreA?: number | null\n  scoreB?: number | null\n  played: boolean\n}\n\nexport type Group = {\n  name: string\n  matches: Match[]\n}\n\nexport const groups: Group[] = ${JSON.stringify([{ name: 'FIFA World Cup 2026', matches: items }], null, 2)}\n`

    if (!items || items.length === 0) {
      console.warn('No se encontraron partidos 2026 en la respuesta; no se sobrescribirá src/data/fixtures.ts')
      return
    }

    // write backup of previous fixtures if exists
    try {
      if (fs.existsSync('src/data/fixtures.ts')) fs.copyFileSync('src/data/fixtures.ts', 'src/data/fixtures.backup.ts')
    } catch (e) {
      console.warn('No pude crear backup:', e.message)
    }

    fs.writeFileSync('src/data/fixtures.ts', output, 'utf8')
    console.log('Fixture guardado en src/data/fixtures.ts con', items.length, 'partidos')
    return
  } catch (err) {
    console.error('Fallo API FIFA:', err && err.message ? err.message : err)
  }

  console.log('Intentando fallback por HTML...')
  try {
    const page = await fetch('https://www.fifa.com/worldcup/matches')
    const html = await page.text()
    try { fs.writeFileSync('scripts/fixtures_raw.html', html, 'utf8') } catch (e) { console.warn('No pude escribir scripts/fixtures_raw.html:', e.message) }

    const re = /<time[^>]*datetime="([^"]+)"[^>]*>[^<]*<\/time>[\s\S]*?data-home="([^"]+)"[\s\S]*?data-away="([^"]+)"/gi
    const items = []
    let m
    while ((m = re.exec(html))) {
      items.push({ date: m[1].split('T')[0], datetime: m[1], teamA: m[2], teamB: m[3], played: false })
    }
    fs.writeFileSync('src/data/fixtures.ts', `export const groups = [ { name: 'FIFA World Cup 2026 (fallback)', matches: ${JSON.stringify(items, null, 2)} } ]`, 'utf8')
    console.log('Fallback saved', items.length)
  } catch (err) {
    console.error('Fallback failed:', err && err.message ? err.message : err)
    process.exit(1)
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
