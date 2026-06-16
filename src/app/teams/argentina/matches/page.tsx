import Link from 'next/link'
import { groups } from '../../../../data/fixtures'

function formatDateTime(datetime?: string, dateOnly?: string) {
  if (datetime) {
    try {
      const d = new Date(datetime)
      return d.toLocaleString('es-AR', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'America/Argentina/Buenos_Aires',
      })
    } catch {
      return datetime
    }
  }
  if (dateOnly) return new Date(dateOnly).toLocaleDateString('es-AR')
  return 'Fecha no disponible'
}

export default function ArgentinaMatches() {
  const allMatches = groups.flatMap((g) => g.matches)
  const argMatches = allMatches.filter((m) => m.teamA === 'Argentina' || m.teamB === 'Argentina')

  return (
    <main style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>Partidos de Argentina - Mundial 2026</h1>
      <p style={{ marginTop: 0, color: '#64748b' }}>Fechas y horarios en zona de Argentina (America/Argentina/Buenos_Aires).</p>

      <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
        {argMatches.length ? (
          argMatches.map((m, i) => {
            const opponent = m.teamA === 'Argentina' ? m.teamB : m.teamA
            const home = m.teamA === 'Argentina'
            return (
              <div key={i} style={{ padding: 12, borderRadius: 10, background: '#fff', border: '1px solid #e6e6e6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{home ? 'Argentina vs ' + opponent : opponent + ' vs Argentina'}</div>
                    <div style={{ color: '#64748b', fontSize: '0.95rem' }}>{formatDateTime(m.datetime, m.date)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {m.played ? (
                      <div style={{ color: '#16a34a', fontWeight: 700 }}>{`${m.scoreA ?? '-'} : ${m.scoreB ?? '-'}`}</div>
                    ) : (
                      <div style={{ color: '#f97316', fontWeight: 600 }}>Pendiente</div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div>No hay partidos programados para Argentina.</div>
        )}
      </div>

      <p style={{ marginTop: 20 }}>
        <Link href="/teams">Volver a la lista</Link>
      </p>
    </main>
  )
}
