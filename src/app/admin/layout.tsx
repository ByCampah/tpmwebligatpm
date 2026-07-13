import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Protect all /admin routes
  if (!session || !session.user) {
    redirect("/");
  }

  // Allow only ADMIN or MODERATOR
  if (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR") {
    return (
      <div className="max-w-4xl mx-auto mt-20 p-8 bg-destructive/10 border border-destructive/20 rounded-xl text-center">
        <h1 className="text-2xl font-black text-destructive mb-4">ACCESO DENEGADO</h1>
        <p className="text-muted-foreground mb-6">No tienes permisos de Administrador ni Moderador para ver esta sección.</p>
        <Link href="/" className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors">
          Volver al Inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Sidebar Admin */}
      <aside className="w-full md:w-64 flex-shrink-0 flex flex-col gap-4">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col gap-2 shadow-[0_0_30px_rgba(16,185,129,0.1)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"></div>
          
          <h2 className="font-black text-2xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 mb-4 pb-2 border-b border-white/10 flex items-center gap-2">
            <span>🛡️</span> Panel Admin
          </h2>
          
          <nav className="flex flex-col gap-2 relative z-10">
            <Link href="/admin" className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-3 group">
              <span className="group-hover:scale-125 transition-transform">🏠</span> 
              <span>Inicio Admin</span>
            </Link>

            <div className="text-[10px] font-black text-blue-400/80 uppercase mt-4 mb-1 px-4 tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Operaciones
            </div>
            <Link href="/admin/noticias" className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-blue-300 hover:bg-blue-900/30 transition-all flex items-center gap-3 group">
              <span className="group-hover:scale-125 transition-transform">📰</span> <span>Publicar Noticias</span>
            </Link>
            <Link href="/admin/temporadas" className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-blue-300 hover:bg-blue-900/30 transition-all flex items-center gap-3 group">
              <span className="group-hover:scale-125 transition-transform">🏆</span> <span>Temporadas y Torneos</span>
            </Link>
            <Link href="/admin/torneos-extra" className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-blue-300 hover:bg-blue-900/30 transition-all flex items-center gap-3 group">
              <span className="group-hover:scale-125 transition-transform">⚡</span> <span>Torneos Extras</span>
            </Link>
            <Link href="/admin/graficas" className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-blue-300 hover:bg-blue-900/30 transition-all flex items-center gap-3 group">
              <span className="group-hover:scale-125 transition-transform">🎨</span> <span>Generador Gráfico</span>
            </Link>

            {session.user.role === "ADMIN" && (
              <>
                <div className="text-[10px] font-black text-purple-400/80 uppercase mt-4 mb-1 px-4 tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span> Sistema
                </div>
                <Link href="/admin/firmas" className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-purple-300 hover:bg-purple-900/30 transition-all flex items-center gap-3 group">
                  <span className="group-hover:scale-125 transition-transform">🔒</span> <span>Firmas Anti-DU</span>
                </Link>
                <Link href="/admin/db" className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-purple-300 hover:bg-purple-900/30 transition-all flex items-center gap-3 group">
                  <span className="group-hover:scale-125 transition-transform">💾</span> <span>Gestor de Datos</span>
                </Link>
                <div className="text-[10px] font-black text-emerald-400/80 uppercase mt-4 mb-1 px-4 tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Base de Datos
                </div>
                <Link href="/admin/equipos" className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-emerald-300 hover:bg-emerald-900/30 transition-all flex items-center gap-3 group">
                  <span className="group-hover:scale-125 transition-transform">🛡️</span> <span>Gestión de Clubes</span>
                </Link>
                <Link href="/admin/selecciones" className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-emerald-300 hover:bg-emerald-900/30 transition-all flex items-center gap-3 group">
                  <span className="group-hover:scale-125 transition-transform">🌎</span> <span>Gestión de Selecciones</span>
                </Link>
                <Link href="/admin/jugadores" className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-emerald-300 hover:bg-emerald-900/30 transition-all flex items-center gap-3 group">
                  <span className="group-hover:scale-125 transition-transform">🏃</span> <span>Gestión de Jugadores</span>
                </Link>
                <Link href="/admin/categorias" className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-emerald-300 hover:bg-emerald-900/30 transition-all flex items-center gap-3 group">
                  <span className="group-hover:scale-125 transition-transform">🏷️</span> <span>Gestión de Categorías</span>
                </Link>
                <Link href="/admin/usuarios" className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-emerald-300 hover:bg-emerald-900/30 transition-all flex items-center gap-3 group">
                  <span className="group-hover:scale-125 transition-transform">👥</span> <span>Cuentas y Roles</span>
                </Link>

                <div className="text-[10px] font-black text-amber-400/80 uppercase mt-4 mb-1 px-4 tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Premios
                </div>
                <Link href="/admin/premios" className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-amber-300 hover:bg-amber-900/30 transition-all flex items-center gap-3 group">
                  <span className="group-hover:scale-125 transition-transform">🎁</span> <span>Asignar Premios</span>
                </Link>

                <div className="text-[10px] font-black text-red-400/80 uppercase mt-4 mb-1 px-4 tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Seguridad
                </div>
                <Link href="/admin/logs" className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-red-300 hover:bg-red-900/30 transition-all flex items-center gap-3 group">
                  <span className="group-hover:scale-125 transition-transform">📋</span> <span>Registro de Acciones (Logs)</span>
                </Link>
                <Link href="/admin/visitas" className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-red-300 hover:bg-red-900/30 transition-all flex items-center gap-3 group">
                  <span className="group-hover:scale-125 transition-transform">👁️</span> <span>Registro de Visitas</span>
                </Link>
              </>
            )}
          </nav>
        </div>
        
        <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-6 relative overflow-hidden group hover:bg-red-950/50 transition-colors">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <p className="text-xs text-red-400 font-bold flex items-start gap-2">
            <span className="text-lg">⚠️</span>
            <span>Zona de peligro. Los datos ingresados modifican la base de datos oficial.</span>
          </p>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1 bg-card border border-border rounded-xl p-8 shadow-lg">
        {children}
      </main>
    </div>
  );
}
