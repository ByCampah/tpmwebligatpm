import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { cookies } from "next/headers";
import { getDictionary } from "@/i18n/getDictionary";

export default async function HistorialPage() {
  const locale = "es";
  const t = await getDictionary(locale);
  // Fetch all seasons, ordered by name or creation
  const seasons = await prisma.season.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      tournaments: true
    }
  });

  // Since we want them ordered chronologically usually (Temporada 1 to 9), let's sort by name properly
  // Since 'Temporada 10' might come before 'Temporada 2' if sorted alphabetically, we extract the number.
  const sortedSeasons = seasons.sort((a, b) => {
    const numA = parseInt(a.name.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.name.replace(/\D/g, '')) || 0;
    return numB - numA; // Descending order (newest first)
  });

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-black neon-text uppercase">{t.history.title}</h1>
        <p className="text-muted-foreground">
          {t.history.subtitle}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedSeasons.map((season) => (
          <Link href={`/historial/${season.id}`} key={season.id} className="group flex flex-col">
            <div className="bg-card border border-border rounded-xl p-6 h-full shadow-lg hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300 pointer-events-none"></div>
              
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold group-hover:text-primary transition-colors">
                  {season.name}
                </h2>
                {season.isActive && (
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-bold rounded border border-primary/30">
                    ACTIVA
                  </span>
                )}
              </div>
              
              <div className="flex flex-col gap-2 text-sm text-muted-foreground mt-auto">
                <div className="p-4 flex flex-col items-center justify-center min-h-[120px] gap-2">
                <span className="text-2xl font-black">{season.name}</span>
                <span className="text-sm text-muted-foreground">
                  {season.tournaments.length} {season.tournaments.length === 1 ? 'Torneo' : 'Torneos'}
                </span>
              </div>  {season.tournaments.map(t => (
                  <div key={t.id} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span className="truncate">{t.name}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex items-center text-primary font-bold text-sm gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                Ver Detalles <span className="text-lg leading-none">→</span>
              </div>
            </div>
          </Link>
        ))}

        {sortedSeasons.length === 0 && (
          <div className="col-span-full p-12 text-center bg-card border border-border rounded-xl">
            <p className="text-muted-foreground text-lg">No hay temporadas registradas aún.</p>
          </div>
        )}
      </div>
    </div>
  );
}
