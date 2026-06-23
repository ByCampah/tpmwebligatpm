import { auth } from "@/auth"
import { redirect } from "next/navigation"
import ProfileForm from "@/components/ProfileForm"

export const metadata = {
  title: "Mi Perfil | Liga TPM Sudamérica",
}

export default async function PerfilPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/")
  }

  return (
    <main className="min-h-screen bg-[#111111] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#111111] to-black pt-32 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-8">
          MI PERFIL
        </h1>
        
        <ProfileForm user={session.user} />
      </div>
    </main>
  )
}
