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
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-2">
          <h2 className="font-black text-xl text-primary mb-4 border-b border-border pb-2">Panel Admin</h2>
          
          <nav className="flex flex-col gap-2">
            <Link href="/admin" className="px-4 py-2 rounded-lg text-sm font-bold text-muted-foreground hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2">
              <span>🏠</span> Inicio Admin
            </Link>

            <div className="text-xs font-black text-blue-400 uppercase mt-4 mb-2 px-4 tracking-wider flex items-center gap-2"><span>⚙️</span> Operaciones</div>
            <Link href="/admin/noticias" className="px-4 py-2 rounded-lg text-sm font-bold text-muted-foreground hover:text-blue-300 hover:bg-blue-900/30 transition-colors flex items-center gap-2">
              <span>📰</span> Publicar Noticias
            </Link>
            <Link href="/admin/temporadas" className="px-4 py-2 rounded-lg text-sm font-bold text-muted-foreground hover:text-blue-300 hover:bg-blue-900/30 transition-colors flex items-center gap-2">
              <span>🏆</span> Temporadas y Torneos
            </Link>
            <Link href="/admin/torneos-extra" className="px-4 py-2 rounded-lg text-sm font-bold text-muted-foreground hover:text-blue-300 hover:bg-blue-900/30 transition-colors flex items-center gap-2">
              <span>⚡</span> Torneos Extras
            </Link>
            <Link href="/admin/graficas" className="px-4 py-2 rounded-lg text-sm font-bold text-muted-foreground hover:text-blue-300 hover:bg-blue-900/30 transition-colors flex items-center gap-2">
              <span>🎨</span> Generador Gráfico
            </Link>

            {session.user.role === "ADMIN" && (
              <>
                <div className="text-xs font-black text-emerald-400 uppercase mt-4 mb-2 px-4 tracking-wider flex items-center gap-2"><span>🗄️</span> Base de Datos</div>
                <Link href="/admin/equipos" className="px-4 py-2 rounded-lg text-sm font-bold text-muted-foreground hover:text-emerald-300 hover:bg-emerald-900/30 transition-colors flex items-center gap-2">
                  <span>🛡️</span> Gestión de Clubes
                </Link>
                <Link href="/admin/selecciones" className="px-4 py-2 rounded-lg text-sm font-bold text-muted-foreground hover:text-emerald-300 hover:bg-emerald-900/30 transition-colors flex items-center gap-2">
                  <span>🌎</span> Gestión de Selecciones
                </Link>
                <Link href="/admin/jugadores" className="px-4 py-2 rounded-lg text-sm font-bold text-muted-foreground hover:text-emerald-300 hover:bg-emerald-900/30 transition-colors flex items-center gap-2">
                  <span>🏃</span> Gestión de Jugadores
                </Link>
                <Link href="/admin/categorias" className="px-4 py-2 rounded-lg text-sm font-bold text-muted-foreground hover:text-emerald-300 hover:bg-emerald-900/30 transition-colors flex items-center gap-2">
                  <span>🏷️</span> Gestión de Categorías
                </Link>
                <Link href="/admin/usuarios" className="px-4 py-2 rounded-lg text-sm font-bold text-muted-foreground hover:text-emerald-300 hover:bg-emerald-900/30 transition-colors flex items-center gap-2">
                  <span>👥</span> Cuentas y Roles
                </Link>

                <div className="text-xs font-black text-amber-400 uppercase mt-4 mb-2 px-4 tracking-wider flex items-center gap-2"><span>🥇</span> Premios</div>
                <Link href="/admin/premios" className="px-4 py-2 rounded-lg text-sm font-bold text-muted-foreground hover:text-amber-300 hover:bg-amber-900/30 transition-colors flex items-center gap-2">
                  <span>🎁</span> Asignar Premios
                </Link>

                <div className="text-xs font-black text-red-400 uppercase mt-4 mb-2 px-4 tracking-wider flex items-center gap-2"><span>🔒</span> Seguridad</div>
                <Link href="/admin/logs" className="px-4 py-2 rounded-lg text-sm font-bold text-muted-foreground hover:text-red-300 hover:bg-red-900/30 transition-colors flex items-center gap-2">
                  <span>📋</span> Registro de Acciones (Logs)
                </Link>
              </>
            )}
          </nav>
        </div>
        
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6">
           <p className="text-xs text-destructive font-bold text-center">
             Zona de peligro. Los datos ingresados modifican la base de datos oficial.
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
