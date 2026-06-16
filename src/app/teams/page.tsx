import Link from 'next/link'
import { teams } from '../../data/teams'

export default function TeamsPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Selecciones - Mundial 2026</h1>
      <p>Lista de selecciones detectadas. Haz clic para ver la plantilla.</p>
      <ul>
        {teams.map((t) => (
          <li key={t.name} style={{ margin: '6px 0' }}>
            <Link href={`/teams/${encodeURIComponent(t.name)}`}>
              {t.name} ({(t.players && t.players.length) || 0} jugadores)
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
