import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const newsItem = await prisma.news.findUnique({
    where: { id: params.id }
  });

  if (!newsItem) {
    return { title: "Noticia no encontrada" };
  }

  return {
    title: `${newsItem.title} | Liga TPM`,
    description: newsItem.content.substring(0, 150) + "...",
  };
}

export default async function NewsDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const newsItem = await prisma.news.findUnique({
    where: { id: params.id },
    include: { author: true }
  });

  if (!newsItem) {
    notFound();
  }

  // Preserve line breaks
  const formattedContent = newsItem.content.split('\n').map((line, i) => (
    <span key={i}>
      {line}
      <br />
    </span>
  ));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/noticias" className="text-primary hover:underline font-bold mb-6 inline-block">
        &larr; Volver a Noticias
      </Link>

      <article className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
        {newsItem.imageUrl && (
          <div className="w-full h-64 md:h-96">
            <img src={newsItem.imageUrl} alt={newsItem.title} className="w-full h-full object-cover" />
          </div>
        )}
        
        <div className="p-8 md:p-12">
          {newsItem.isFeatured && (
            <span className="inline-block bg-primary text-black font-black text-xs px-3 py-1 rounded-full mb-4">
              DESTACADA
            </span>
          )}
          
          <h1 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
            {newsItem.title}
          </h1>
          
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
            {newsItem.author?.image || newsItem.author?.customAvatarUrl ? (
              <img src={newsItem.author.customAvatarUrl || newsItem.author.image || ""} alt="Author" className="w-12 h-12 rounded-full object-cover border border-border" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground border border-border">
                {newsItem.author?.nickName?.charAt(0) || "A"}
              </div>
            )}
            <div>
              <div className="font-bold text-white text-lg">
                {newsItem.author?.nickName || newsItem.author?.name || "Administración"}
              </div>
              <div className="text-sm text-muted-foreground">
                Publicado el {new Date(newsItem.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>

          <div className="text-lg text-white/90 leading-relaxed font-serif">
            {formattedContent}
          </div>
        </div>
      </article>
    </div>
  );
}
