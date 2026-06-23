import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Noticias | Liga TPM",
  description: "Últimas noticias y novedades de Liga TPM.",
};

export const dynamic = 'force-dynamic';

export default async function NoticiasPage() {
  const newsList = await prisma.news.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: true }
  });

  const featured = newsList.find(n => n.isFeatured);
  const others = newsList.filter(n => !n.isFeatured);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-8">Noticias</h1>

      {newsList.length === 0 && (
        <div className="text-center py-20 bg-secondary/30 rounded-xl border border-border">
          <p className="text-muted-foreground text-lg font-bold">Aún no hay noticias publicadas.</p>
        </div>
      )}

      {featured && (
        <Link href={`/noticias/${featured.id}`} className="group block mb-12">
          <div className="relative rounded-2xl overflow-hidden border border-primary/50 shadow-[0_0_30px_rgba(34,197,94,0.15)] transition-all group-hover:border-primary group-hover:shadow-[0_0_40px_rgba(34,197,94,0.3)]">
            {featured.imageUrl ? (
              <div className="h-64 md:h-96 w-full relative">
                <img src={featured.imageUrl} alt={featured.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              </div>
            ) : (
              <div className="h-48 md:h-64 w-full bg-gradient-to-br from-primary/20 to-black relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
              <span className="inline-block bg-primary text-black font-black text-xs px-3 py-1 rounded-full mb-3 shadow-lg">DESTACADA</span>
              <h2 className="text-2xl md:text-4xl font-black text-white mb-2 group-hover:text-primary transition-colors">{featured.title}</h2>
              <p className="text-muted-foreground line-clamp-2 md:line-clamp-3 mb-4 max-w-3xl">
                {featured.content}
              </p>
              <div className="text-sm font-bold text-white/50">
                {featured.author?.nickName || featured.author?.name || 'Admin'} • {new Date(featured.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </Link>
      )}

      {others.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {others.map(news => (
            <Link key={news.id} href={`/noticias/${news.id}`} className="group block">
              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg h-full flex flex-col transition-all hover:border-primary/50 hover:shadow-xl hover:-translate-y-1">
                {news.imageUrl && (
                  <div className="h-48 w-full overflow-hidden">
                    <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-xl text-white mb-2 group-hover:text-primary transition-colors">{news.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                    {news.content}
                  </p>
                  <div className="text-xs font-bold text-muted-foreground mt-auto">
                    {new Date(news.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
