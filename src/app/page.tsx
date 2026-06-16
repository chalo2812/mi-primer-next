import { groups, Match } from '../data/fixtures'

const stages = [
  "Fase de Grupos",
  "Octavos de Final (Round of 32)",
  "Octavos de Final (Round of 16)",
  "Cuartos de Final",
  "Semifinal",
  "Tercer Lugar",
  "Final",
];

function MatchRow({ m }: { m: Match }) {
  return (
    <div className="flex items-center justify-between w-full px-4 py-2 border-b last:border-b-0">
      <div className="text-sm text-zinc-600">{m.date}</div>
      <div className="flex-1 px-4 flex items-center justify-center gap-4">
        <div className="w-36 text-right">{m.teamA}</div>
        <div className="w-24 text-center font-medium">
          {m.played ? `${m.scoreA ?? "-"} : ${m.scoreB ?? "-"}` : "Pendiente"}
        </div>
        <div className="w-36">{m.teamB}</div>
      </div>
      <div className="w-28 text-right text-sm">
        {m.played ? <span className="text-green-600">Jugado</span> : <span className="text-orange-600">Pendiente</span>}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-start bg-zinc-50 font-sans min-h-screen py-8">
      <main className="w-full max-w-4xl px-6">
        <header className="mb-8">
          <h1 className="text-4xl font-bold">Fixture - Mundial de Fútbol 2026</h1>
          <p className="text-zinc-600 mt-2">Partidos jugados y pendientes. Actualiza los resultados según avance el torneo.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {groups.map((g) => (
            <div key={g.name} className="bg-white rounded-lg shadow-sm">
              <div className="px-4 py-3 border-b">
                <h2 className="font-semibold">{g.name}</h2>
              </div>
              <div>
                {g.matches.map((m, i) => (
                  <MatchRow key={i} m={m} />
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-lg shadow-sm p-6 mb-12">
          <h2 className="text-2xl font-semibold mb-4">Siguientes etapas</h2>
          <ul className="space-y-2">
            {stages.map((s) => (
              <li key={s} className="flex items-center justify-between">
                <span>{s}</span>
                <span className="text-sm text-zinc-500">Pendiente</span>
              </li>
            ))}
          </ul>
        </section>

        <footer className="text-sm text-zinc-500">Datos de ejemplo ? personaliza equipos y resultados según necesites.</footer>
      </main>
    </div>
  );
}
