import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";
import { Home, Newspaper, Trophy, History, Shield, Medal, Users, UserSquare, Store, LogIn } from "lucide-react";
import VisitTracker from "@/components/VisitTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Liga TPM - Online Football Manager",
  description: "Estadísticas, equipos y torneos de la comunidad TPM.",
};

const navLinks = [
  { name: 'Inicio', href: '/' },
  { name: 'Noticias', href: '/noticias' },
  { name: 'Liga Actual', href: '/liga' },
  { name: 'Historial', href: '/historial' },
  { name: 'Pretemporada', href: '/extras' },
  { name: 'Challenges', href: '/challenges' },
  { name: 'Trofeos', href: '/trofeos' },
  { name: 'Equipos', href: '/equipos' },
  { name: 'Selecciones', href: '/selecciones' },
  { name: 'Jugadores', href: '/jugadores' },
  { name: 'Mercado', href: '/mercado' },
];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-transparent`}
      >
        <VisitTracker />
        <div className="fixed inset-0 z-[-1] bg-[#000000] overflow-hidden pointer-events-none">
          {/* Animated gradient orbs */}
          <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-emerald-600/20 blur-[120px] mix-blend-screen animate-pulse-slow"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-blue-700/20 blur-[150px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-[40%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-purple-600/10 blur-[100px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
          {/* Grid overlay for texture */}
          <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        </div>

        <header className="border-b border-white/5 bg-black/50 backdrop-blur-2xl sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="container mx-auto px-4 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.4)] bg-black/80">
                <img src="/img/logos/LogoTPM.png" alt="Logo TPM" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              </div>
              <span className="font-black text-3xl tracking-tighter hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-lg group-hover:neon-text transition-all duration-300">Liga TPM</span>
            </Link>
            
            <div className="flex-1 flex justify-center hidden lg:flex">
              <nav className="flex gap-4 xl:gap-6 items-center">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href} 
                    className="relative text-sm xl:text-base font-semibold text-muted-foreground hover:text-primary transition-colors py-2 group flex flex-col items-center"
                  >
                    <span>{link.name}</span>
                    {(link as any).badge && (
                      <span className="text-[10px] text-primary/80 uppercase font-black tracking-widest leading-none mt-0.5">
                        {(link as any).badge}
                      </span>
                    )}
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                  </Link>
                ))}
              </nav>
            </div>
            
            <div className="flex items-center gap-4 ml-auto">
              {session?.user ? (
                <div className="flex items-center gap-4">
                  <div className="hidden lg:flex flex-col items-end">
                    <span className="text-sm font-bold text-white">{session.user.nickName || session.user.name}</span>
                    <span className="text-xs text-tpm-primary font-medium">{session.user.role}</span>
                  </div>
                  <Link href="/perfil" className="w-10 h-10 rounded-full border-2 border-tpm-primary overflow-hidden hover:scale-105 transition-transform">
                    <img src={session.user.customAvatarUrl || session.user.image || ""} alt="Avatar" className="w-full h-full object-cover" />
                  </Link>
                  {(session.user.role === "ADMIN" || session.user.role === "MODERATOR") && (
                    <Link href="/admin" className="text-sm font-bold text-gray-400 hover:text-white transition-colors bg-gray-800 px-3 py-1.5 rounded-lg hidden sm:block">
                      Panel
                    </Link>
                  )}
                  <form action={async () => {
                    "use server"
                    await signOut({ redirectTo: "/" })
                  }}>
                    <button type="submit" className="text-sm font-bold text-red-400 hover:text-red-300 transition-colors">
                      Salir
                    </button>
                  </form>
                </div>
              ) : (
                <form action={async () => {
                  "use server"
                  await signIn("discord", { redirectTo: "/" })
                }}>
                  <button type="submit" className="flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    <span className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center text-[10px]">D</span>
                    Iniciar Sesión
                  </button>
                </form>
              )}
            </div>

          </div>
        </header>
        
        <main className="flex-1 container mx-auto px-4 py-8">
          {children}
        </main>
        
        <footer className="border-t border-border bg-card py-12 mt-auto">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 text-sm text-muted-foreground text-center md:text-left items-start">
            
            <div className="flex flex-col items-center md:items-start">
              <p className="font-bold text-lg text-primary mb-3">Comunidad TPM</p>
              <div className="flex flex-col gap-2">
                <a href="https://discord.gg/7WZVN8qTsA" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center justify-center md:justify-start gap-2">
                  <svg className="w-4 h-4 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
                  Discord Oficial
                </a>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-start">
              <p className="font-bold text-lg text-primary mb-3">Streams</p>
              <div className="flex flex-col gap-2">
                <a href="https://kick.com/campah" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center justify-center md:justify-start gap-2">
                  <span className="font-black text-[#53FC18] text-[10px] tracking-widest bg-[#53FC18]/10 px-1 rounded">KICK</span>
                  Kick Campah
                </a>
                <a href="https://kick.com/cerviyb" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center justify-center md:justify-start gap-2">
                  <span className="font-black text-[#53FC18] text-[10px] tracking-widest bg-[#53FC18]/10 px-1 rounded">KICK</span>
                  Kick Cerviyb
                </a>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 mb-4">
                <img src="/img/logos/LogoTPM.png" alt="Liga TPM" className="w-full h-full object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
              </div>
              <p className="font-bold text-white mb-1">Liga TPM</p>
              <p>© {new Date().getFullYear()} Creado por Campah</p>
              <p className="mt-1 text-xs opacity-70">Desarrollado para la comunidad</p>
            </div>

            <div className="flex flex-col items-center md:items-start">
              <p className="font-bold text-lg text-primary mb-3">Redes de Campah</p>
              <div className="flex flex-col gap-2">
                <a href="https://www.instagram.com/bycampah/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center justify-center md:justify-start gap-2">
                  <svg className="w-4 h-4 text-[#E1306C]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  Instagram
                </a>
                <a href="https://www.tiktok.com/@bycampah" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center justify-center md:justify-start gap-2">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.96-.5 3.96-1.68 5.56-1.16 1.59-2.87 2.72-4.78 3.12-2.02.43-4.2.14-5.99-.86-1.78-.99-3.08-2.6-3.64-4.52-.56-1.92-.32-4.08.68-5.78 1.01-1.72 2.65-3.02 4.54-3.56 1.05-.3 2.15-.36 3.23-.22v4.06c-.63-.12-1.28-.08-1.89.13-.58.19-1.1.58-1.45 1.07-.36.5-.54 1.13-.5 1.76.03.62.27 1.22.68 1.7.4.47.96.8 1.56.96.6.15 1.25.13 1.83-.07.57-.2 1.07-.58 1.41-1.07.35-.49.53-1.11.53-1.73V0h3.91z"/></svg>
                  TikTok
                </a>
                <a href="https://www.youtube.com/@ByCampah" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center justify-center md:justify-start gap-2">
                  <svg className="w-4 h-4 text-[#FF0000]" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  YouTube
                </a>
                <a href="https://discord.gg/xpGVgQ4qSN" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center justify-center md:justify-start gap-2">
                  <svg className="w-4 h-4 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
                  Discord
                </a>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-start">
              <p className="font-bold text-lg text-primary mb-3">Redes de Cerviyb</p>
              <div className="flex flex-col gap-2">
                <a href="https://www.instagram.com/cerviyb/?hl=es-la" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center justify-center md:justify-start gap-2">
                  <svg className="w-4 h-4 text-[#E1306C]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  Instagram
                </a>
                <a href="https://www.tiktok.com/@cerviybb" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center justify-center md:justify-start gap-2">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.96-.5 3.96-1.68 5.56-1.16 1.59-2.87 2.72-4.78 3.12-2.02.43-4.2.14-5.99-.86-1.78-.99-3.08-2.6-3.64-4.52-.56-1.92-.32-4.08.68-5.78 1.01-1.72 2.65-3.02 4.54-3.56 1.05-.3 2.15-.36 3.23-.22v4.06c-.63-.12-1.28-.08-1.89.13-.58.19-1.1.58-1.45 1.07-.36.5-.54 1.13-.5 1.76.03.62.27 1.22.68 1.7.4.47.96.8 1.56.96.6.15 1.25.13 1.83-.07.57-.2 1.07-.58 1.41-1.07.35-.49.53-1.11.53-1.73V0h3.91z"/></svg>
                  TikTok
                </a>
                <a href="https://discord.gg/KMAgjumg6P" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center justify-center md:justify-start gap-2">
                  <svg className="w-4 h-4 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
                  Discord
                </a>
              </div>
            </div>

          </div>
        </footer>
      </body>
    </html>
  );
}
