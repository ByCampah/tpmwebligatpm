import { prisma } from "@/lib/prisma";
import NewsAdminClient from "./NewsAdminClient";

export const dynamic = 'force-dynamic';

export default async function AdminNoticiasPage() {
  const newsList = await prisma.news.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: true }
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-black text-white">Gestión de Noticias</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Crea y edita noticias para la comunidad. Puedes fijar una noticia como destacada para que aparezca en la portada.
        </p>
      </div>

      <NewsAdminClient initialNews={newsList} />
    </div>
  );
}
