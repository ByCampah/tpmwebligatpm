import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ProfileForm from "@/components/ProfileForm"
import ProfileMarketClient from "./ProfileMarketClient"

export const metadata = {
  title: "Mi Perfil | Liga TPM Sudamérica",
}

export const dynamic = 'force-dynamic';

export default async function PerfilPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/")
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      player: true,
      captainOfTeams: true
    }
  });

  if (!dbUser) {
    redirect("/")
  }

  return (
    <main className="min-h-screen bg-[#111111] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#111111] to-black pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
        
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-8">
            MI PERFIL
          </h1>
          <ProfileForm user={session.user} />
        </div>

        {/* Mercado de Pases Section */}
        <div className="w-full md:w-80 flex-shrink-0">
          <ProfileMarketClient user={dbUser} />
        </div>

      </div>
    </main>
  )
}
