import Link from 'next/link'
import { teams } from '../../../data/teams'

type RawPlayer = string

type Player = {
  name: string
  club: string
  position: string
  photoUrl: string | null
}

const countryMeta: Record<string, { code: string; color: string }> = {
  Canada: { code: 'ca', color: '#ff0000' },
  Mexico: { code: 'mx', color: '#006847' },
  'United States': { code: 'us', color: '#b22234' },
  USA: { code: 'us', color: '#b22234' },
  Argentina: { code: 'ar', color: '#75aadb' },
  Brazil: { code: 'br', color: '#009c3b' },
  Germany: { code: 'de', color: '#000000' },
  France: { code: 'fr', color: '#0055A4' },
  Spain: { code: 'es', color: '#AA151B' },
  England: { code: 'gb', color: '#d40000' },
  Portugal: { code: 'pt', color: '#006600' },
  Netherlands: { code: 'nl', color: '#21468b' },
  Belgium: { code: 'be', color: '#000000' },
  Italy: { code: 'it', color: '#008C45' },
  Uruguay: { code: 'uy', color: '#75aadb' },
  Colombia: { code: 'co', color: '#FFD100' },
  Chile: { code: 'cl', color: '#d52b1e' },
  Peru: { code: 'pe', color: '#d91023' },
  Ecuador: { code: 'ec', color: '#0033a0' },
  Paraguay: { code: 'py', color: '#002d62' },
  Bolivia: { code: 'bo', color: '#006600' },
  Venezuela: { code: 've', color: '#fcd116' },
  Japan: { code: 'jp', color: '#bc002d' },
  'South Korea': { code: 'kr', color: '#003478' },
  Australia: { code: 'au', color: '#002b7f' },
  Iran: { code: 'ir', color: '#239f40' },
  'Saudi Arabia': { code: 'sa', color: '#006c35' },
  'United Arab Emirates': { code: 'ae', color: '#00732f' },
  Iraq: { code: 'iq', color: '#007a3d' },
  Morocco: { code: 'ma', color: '#c1272d' },
  Tunisia: { code: 'tn', color: '#e70013' },
  Nigeria: { code: 'ng', color: '#008751' },
  Senegal: { code: 'sn', color: '#006233' },
  Cameroon: { code: 'cm', color: '#007a5e' },
  Ghana: { code: 'gh', color: '#006b3c' },
  Egypt: { code: 'eg', color: '#ce1126' },
  Switzerland: { code: 'ch', color: '#e31b23' },
  Austria: { code: 'at', color: '#ed2939' },
  Poland: { code: 'pl', color: '#dc143c' },
  Croatia: { code: 'hr', color: '#ff0000' },
  Denmark: { code: 'dk', color: '#c60c30' },
  Sweden: { code: 'se', color: '#006aa7' },
  Norway: { code: 'no', color: '#ba0c2f' },
  Turkey: { code: 'tr', color: '#e30a17' },
  'Czech Republic': { code: 'cz', color: '#11457e' },
  Scotland: { code: 'gb', color: '#0055a4' },
  Algeria: { code: 'dz', color: '#006233' },
  Wales: { code: 'gb', color: '#c8102e' },
}

const nameAlias: Record<string, string> = {
  USA: 'United States',
  'United States of America': 'United States',
  EEUU: 'United States',
  'Estados Unidos': 'United States',
  Argelia: 'Algeria',
  Algeria: 'Algeria',
  Wales: 'Wales',
}

function resolveCountryName(name: string) {
  if (!name) return name
  if (countryMeta[name]) return name
  const alias = nameAlias[name]
  if (alias && countryMeta[alias]) return alias
  // try capitalizing first letter variants
  const normalized = name.charAt(0).toUpperCase() + name.slice(1)
  if (countryMeta[normalized]) return normalized
  return name
}

function getFlagUrl(teamName: string) {
  const resolved = resolveCountryName(teamName)
  const meta = countryMeta[resolved]
  if (!meta) return '/default-avatar.svg'
  return `https://flagcdn.com/w40/${meta.code.toLowerCase()}.png`
}
const groupAssignments: Record<string, string[]> = {
  A: ['Canada', 'Mexico', 'United States'],
  B: ['Argentina', 'Brazil', 'Germany'],
  C: ['France', 'Spain', 'England'],
  D: ['Portugal', 'Netherlands', 'Belgium'],
  E: ['Italy', 'Uruguay', 'Colombia'],
  F: ['Chile', 'Peru', 'Ecuador'],
  G: ['Paraguay', 'Bolivia', 'Venezuela'],
  H: ['Japan', 'South Korea', 'Australia'],
  I: ['Iran', 'Saudi Arabia', 'United Arab Emirates'],
  J: ['Iraq', 'Morocco', 'Tunisia'],
  K: ['Nigeria', 'Senegal', 'Cameroon'],
  L: ['Ghana', 'Egypt', 'Switzerland'],
  M: ['Austria', 'Poland', 'Croatia'],
  N: ['Denmark', 'Sweden', 'Norway'],
  O: ['Turkey', 'Czech Republic', 'Scotland'],
}

const clubKeywords = [
  'FC', 'SC', 'United', 'City', 'Real', 'AtlÃ©tico', 'Athletic', 'Rangers', 'Juventus', 'Inter', 'AC', 'AS', 'Bayern', 'PSG', 'Sporting', 'Ajax', 'Benfica', 'Porto', 'Flamengo', 'River', 'Barcelona', 'Chelsea', 'Arsenal', 'Manchester', 'Newcastle', 'Liverpool', 'Roma', 'Lyon', 'Monaco', 'Villarreal', 'Napoli', 'Milan', 'Sevilla', 'Atl', 'Celtic', 'Toulouse', 'Bournemouth', 'Galatasaray', 'Fiorentina', 'Braga', 'Marseille', 'Lazio', 'FenerbahÃ§e', 'Zenit', 'Everton', 'Tottenham', 'Borussia', 'Schalke', 'Dortmund', 'Hertha', 'Freiburg', 'Villarreal', 'Dynamo', 'Liefering', 'Eintracht', 'Leverkusen', 'Southampton', 'Wolves', 'Monchengladbach', 'Cruz Azul', 'AmÃ©rica', 'Atlas', 'Santos', 'Pachuca', 'Chivas', 'Racing', 'Palmeiras', 'Corinthians', 'Fluminense', 'Gremio', 'Palermo', 'Spartak'
]

function fixText(text: string) {
  if (!text) return text
  try {
    return decodeURIComponent(escape(text))
  } catch {
    return text
  }
}

function isClubText(text: string) {
  if (!text) return false
  const cleaned = text.trim()
  if (cleaned.length > 40) return false
  if (/[0-9]{2,}/.test(cleaned)) return false
  return clubKeywords.some((keyword) => new RegExp(`\\b${keyword}\\b`, 'i').test(cleaned))
}

function isNameText(text: string) {
  if (!text) return false
  const cleaned = fixText(text).trim()
  if (!cleaned) return false
  if (cleaned.length > 40) return false
  if (/(Captain|GK|DF|MF|FW|Club|United|City|Sporting|AtlÃ©tico|Real)/i.test(cleaned)) return false
  const words = cleaned.split(/\s+/)
  return words.length <= 5
}

function parsePlayers(rawPlayers: readonly RawPlayer[] = []) {
  const parsed: Player[] = []

  for (let index = 0; index < rawPlayers.length; index += 1) {
    const current = fixText(rawPlayers[index] || '').trim()
    const next = fixText(rawPlayers[index + 1] || '').trim()

    if (!current) continue

    if (isNameText(current) && isClubText(next)) {
      parsed.push({ name: current, club: next, position: 'Sin posiciÃ³n', photoUrl: null })
      index += 1
      continue
    }

    if (isClubText(current) && parsed.length) {
      parsed[parsed.length - 1].club = current
      continue
    }

    if (isNameText(current)) {
      parsed.push({ name: current, club: '', position: 'Sin posiciÃ³n', photoUrl: null })
      continue
    }

    if (parsed.length) {
      const previous = parsed[parsed.length - 1]
      if (!previous.club) {
        previous.club = current
        continue
      }
    }

    parsed.push({ name: current, club: '', position: 'Sin posiciÃ³n', photoUrl: null })
  }

  return parsed
}

function getPlayerPhotoUrl(player: Player) {
  if (player.photoUrl) return player.photoUrl
  // usar avatar por defecto local cuando no hay foto
  return '/default-avatar.svg'
}

function groupByPosition(players: Player[]) {
  return players.reduce<Record<string, Player[]>>((groups, player) => {
    const key = player.position || 'Sin posiciÃ³n'
    if (!groups[key]) groups[key] = []
    groups[key].push(player)
    return groups
  }, {} as Record<string, Player[]>)
}

function groupTeams() {
  return Object.entries(groupAssignments).map(([group, names]) => ({
    group,
    teams: names.map((name) => {
      const team = teams.find((item) => item.name === name)
      return team || { name, players: [], source: null, sourceUrl: null }
    }),
  }))
}

export default function AllTeamsPage() {
  const groups = groupTeams()

  return (
    <main style={{ padding: 24, maxWidth: 1280, margin: '0 auto' }}>
      <header style={{ marginBottom: 32 }}>
        <p style={{ margin: 0, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Fixture Mundial 2026
        </p>
        <h1 style={{ margin: '8px 0 12px', fontSize: '2.5rem' }}>Selecciones por grupo</h1>
        <p style={{ margin: 0, color: '#64748b', maxWidth: 720 }}>
          AquÃ­ tienes los grupos colapsados por defecto. Expande un grupo para ver cada selecciÃ³n, su plantilla y jugadores agrupados por posiciÃ³n. Las fotos se cargan desde un servicio externo.
        </p>
      </header>

      <div style={{ display: 'grid', gap: 18 }}>
        {groups.map((group) => {
          const totalPlayers = group.teams.reduce((sum, team) => sum + parsePlayers(team.players || []).length, 0)
          return (
            <details key={group.group} style={{ border: '1px solid #d4d4d8', borderRadius: 18, overflow: 'hidden', background: '#ffffff', boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)' }}>
              <summary style={{ cursor: 'pointer', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, fontSize: '1.05rem', fontWeight: 600, color: '#0f172a' }}>
                <span>Grupo {group.group}</span>
                <span style={{ color: '#475569', fontWeight: 500 }}>{group.teams.length} selecciones Â· {totalPlayers} jugadores</span>
              </summary>

              <div style={{ padding: '0 24px 24px', display: 'grid', gap: 20 }}>
                {group.teams.map((team) => {
                  const parsedPlayers = parsePlayers(team.players || [])
                  const playersByPosition = groupByPosition(parsedPlayers)
                  const positionsOrder = ['Portero', 'Defensa', 'Centrocampista', 'Delantero', 'Sin posiciÃ³n']

                  return (
                    <article key={team.name} style={{ border: '1px solid #e2e8f0', borderRadius: 16, padding: 18, background: '#f8fafc' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img
                            src={getFlagUrl(team.name)}
                            alt={`${team.name} flag`}
                            width={28}
                            height={20}
                            style={{ width: 28, height: 20, objectFit: 'cover', borderRadius: 4 }}
                          />
                          <div>
                            <p style={{ margin: 0, color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.11em' }}>Selección</p>
                            <h2 style={{ margin: '6px 0', fontSize: '1.45rem', color: (countryMeta[resolveCountryName(team.name)] && countryMeta[resolveCountryName(team.name)].color) || '#0f172a' }}>{team.name}</h2>
                            <p style={{ margin: 0, color: '#475569' }}>{parsedPlayers.length} jugadores</p>
                          </div>
                        </div>
                      </div>
                        {parsedPlayers.length ? (
                        Object.entries(playersByPosition)
                          .sort(([a], [b]) => {
                            const indexA = positionsOrder.indexOf(a)
                            const indexB = positionsOrder.indexOf(b)
                            return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB)
                          })
                          .map(([position, players]) => (
                            <section key={position} style={{ marginTop: 20 }}>
                              <h3 style={{ margin: '0 0 12px', fontSize: '1.1rem', color: '#0f172a' }}>{position}</h3>
                              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                                {players.map((player) => (
                                  <div key={`${team.name}-${player.name}`} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12, borderRadius: 14, background: '#ffffff', border: '1px solid #e2e8f0' }}>
                                    <div style={{ minWidth: 64, minHeight: 64, borderRadius: '50%', overflow: 'hidden', background: '#e2e8f0' }}>
                                      <img
                                        src={getPlayerPhotoUrl(player)}
                                        alt={player.name}
                                        width={64}
                                        height={64}
                                        style={{ width: 64, height: 64, objectFit: 'cover', display: 'block' }}
                                      />
                                    </div>
                                    <div>
                                      <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>{player.name}</p>
                                      <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.95rem' }}>{player.club || 'Club no disponible'}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </section>
                          ))
                      ) : (
                        <p style={{ marginTop: 20, color: '#66748a' }}>No hay jugadores extraÃ­dos para esta selecciÃ³n.</p>
                      )}
                    </article>
                  )
                })}
              </div>
            </details>
          )
        })}
      </div>

      <p style={{ marginTop: 30 }}>
        <Link href="/teams">Volver a la lista</Link>
      </p>
    </main>
  )
}
