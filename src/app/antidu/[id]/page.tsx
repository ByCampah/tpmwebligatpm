import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AntiDuClientForm from "./AntiDuClientForm";

export default async function AntiDuPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await prisma.antiDuSession.findUnique({
    where: { id: params.id },
  });

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h1 className="text-4xl font-bold text-red-500 mb-4">Enlace no encontrado</h1>
        <p className="text-white">La sesión Anti-DU no existe o fue eliminada.</p>
        <Link href="/" className="mt-6 px-4 py-2 bg-tpm-primary text-black font-bold rounded">Volver al Inicio</Link>
      </div>
    );
  }

  if (session.status !== "OPEN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h1 className="text-4xl font-bold text-orange-500 mb-4">Sesión Cerrada</h1>
        <p className="text-white">Ya no se aceptan más firmas para este evento.</p>
        <Link href="/" className="mt-6 px-4 py-2 bg-tpm-primary text-black font-bold rounded">Volver al Inicio</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center p-4">
      <div className="bg-secondary/40 p-8 rounded-2xl border border-white/10 max-w-md w-full shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/20 blur-3xl rounded-full"></div>
        
        <div className="mb-6 z-10 relative">
          <h2 className="text-xs font-black text-red-400 uppercase tracking-widest mb-2 border border-red-500/30 bg-red-500/10 py-1 px-3 rounded-full inline-block">
            Verificación de Identidad
          </h2>
          <h1 className="text-2xl font-black text-white mt-4">{session.title}</h1>
          <p className="text-sm text-gray-400 mt-2">
            Ingresa tus datos para confirmar tu participación.
          </p>
        </div>

        <div className="relative z-10 bg-black/40 p-6 rounded-xl border border-white/5">
          <AntiDuClientForm sessionId={session.id} />
        </div>

        <p className="text-xs text-gray-500 mt-6 z-10 relative">
          Este sistema verifica tu dispositivo y conexión para asegurar el juego limpio.
        </p>
      </div>
    </div>
  );
}
