import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import FirmaClientButton from "./FirmaClientButton";

export default async function FirmaPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const lobby = await prisma.signatureLobby.findUnique({
    where: { id: params.id },
  });

  if (!lobby) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h1 className="text-4xl font-bold text-red-500 mb-4">Sala no encontrada</h1>
        <p className="text-white">El enlace parece ser inválido o la sala fue eliminada.</p>
        <Link href="/" className="mt-6 px-4 py-2 bg-tpm-primary text-black font-bold rounded">Volver al Inicio</Link>
      </div>
    );
  }

  const session = await auth();

  let existingSignature = null;
  if (session?.user) {
    existingSignature = await prisma.signature.findUnique({
      where: {
        lobbyId_userId: {
          lobbyId: lobby.id,
          userId: session.user.id
        }
      }
    });
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center p-4">
      <div className="bg-secondary/40 p-8 rounded-2xl border border-white/10 max-w-md w-full shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-tpm-primary/20 blur-3xl rounded-full"></div>
        
        <h1 className="text-2xl font-black text-white mb-2 uppercase">Firma de Asistencia</h1>
        <h2 className="text-lg font-medium text-tpm-primary mb-6 bg-black/40 py-2 rounded-lg border border-white/5">
          {lobby.title}
        </h2>

        {lobby.status === "CLOSED" ? (
          <div className="bg-red-500/20 text-red-400 p-4 rounded-xl border border-red-500/30">
            Esta sala ya se encuentra cerrada.
          </div>
        ) : !session?.user ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-400">
              Debes iniciar sesión con Discord para poder firmar tu asistencia a este partido.
            </p>
            <Link 
              href="/api/auth/signin" 
              className="px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              Iniciar Sesión con Discord
            </Link>
          </div>
        ) : existingSignature ? (
          <div className="bg-green-500/20 text-green-400 p-6 rounded-xl border border-green-500/30 flex flex-col items-center gap-2">
            <div className="text-5xl mb-2">✅</div>
            <p className="font-bold text-xl text-white">¡Asistencia Firmada!</p>
            <p className="text-xs text-green-300">Ya puedes volver al partido. ¡Suerte!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-400 mb-2">
              Se registrará tu IP y una huella de hardware anónima para evitar multicuentas.
            </p>
            <FirmaClientButton lobbyId={lobby.id} />
          </div>
        )}
      </div>
    </div>
  );
}
