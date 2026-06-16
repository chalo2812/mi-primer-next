import Link from 'next/link'
import { teams } from '../../../../data/teams'

interface Props {
  params: { team: string }
}

const countryMeta: Record<string, { code: string; color: string }> = {
  Canada: { code: 'ca', color: '#ff0000' },
  Mexico: { code: 'mx', color: '#006847' },
  'United States': { code: 'us', color: '#b22234' },
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
}

function getFlagUrl(teamName: string) {
  const meta = countryMeta[teamName]
  if (!meta) return '/default-avatar.svg'
  return `https://flagcdn.com/w40/${meta.code.toLowerCase()}.png`
}

export default function TeamPage({ params }: Props) {
  const name = decodeURIComponent(params.team)
  const team = teams.find((t) => t.name === name)

  if (!team) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Equipo no encontrado</h1>
        <p>No se halló la selección: {name}</p>
        <p>
          <Link href="/teams">Volver a la lista</Link>
        </p>
      </main>
    )
  }

  return (
    <main style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src={getFlagUrl(team.name)} alt={`${team.name} flag`} width={36} height={24} style={{ width: 36, height: 24, objectFit: 'cover', borderRadius: 4 }} />
        <h1 style={{ margin: 0, color: (countryMeta[team.name] && countryMeta[team.name].color) || '#0f172a' }}>{team.name}</h1>
      </div>
      <h2 style={{ marginTop: 18 }}>Plantilla ({(team.players && team.players.length) || 0})</h2>
      <ul>
        {(team.players || []).map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
      <p>
        <Link href="/teams">Volver a la lista</Link>
      </p>
    </main>
  )
}
