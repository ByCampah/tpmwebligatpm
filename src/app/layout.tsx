import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Home, Newspaper, Trophy, History, Shield, Medal, Users, UserSquare, Store, LogIn } from "lucide-react";

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
  { name: 'Noticias', href: '#', badge: 'Pronto' },
  { name: 'Liga Actual', href: '/liga' },
  { name: 'Historial', href: '/historial' },
  { name: 'Trofeos Equipos', href: '/trofeos' },
  { name: 'Trofeos Jugadores', href: '/trofeos-jugadores' },
  { name: 'Equipos', href: '/equipos' },
  { name: 'Jugadores', href: '/jugadores' },
  { name: 'Mercado', href: '#', badge: 'Pronto' },
];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <header className="border-b border-border/50 bg-card/60 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-4 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                <img src="/img/logos/LogoTPM.png" alt="Logo TPM" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              </div>
              <span className="font-black text-2xl tracking-tighter hidden sm:block group-hover:neon-text transition-all duration-300">Liga TPM</span>
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
                    {link.badge && (
                      <span className="text-[10px] text-primary/80 uppercase font-black tracking-widest leading-none mt-0.5">
                        {link.badge}
                      </span>
                    )}
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                  </Link>
                ))}
              </nav>
            </div>
            
            <div className="flex items-center gap-4 ml-auto">
              <div className="hidden lg:flex flex-col items-center cursor-pointer group">
                <span className="text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors">
                  Login
                </span>
                <span className="text-[10px] text-primary/80 uppercase font-black tracking-widest leading-none mt-0.5">
                  Próximamente
                </span>
              </div>
            </div>

          </div>
        </header>
        
        <main className="flex-1 container mx-auto px-4 py-8">
          {children}
        </main>
        
        <footer className="border-t border-border bg-card py-12 mt-auto">
          <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8 text-sm text-muted-foreground">
            
            <div className="flex flex-col items-center md:items-start">
              <p className="font-bold text-lg text-primary mb-2">Comunidad</p>
              <div className="flex flex-col gap-1">
                <a href="https://discord.gg/7WZVN8qTsA" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#5865F2]"></span> Discord TPM Sudamérica
                </a>
                <a href="https://discord.gg/xpGVgQ4qSN" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#5865F2]"></span> Discord de Campah
                </a>
                <a href="https://discord.gg/KMAgjumg6P" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#5865F2]"></span> Discord Cerviyb
                </a>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 mb-4">
                <img src="/img/logos/LogoTPM.png" alt="Liga TPM" className="w-full h-full object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
              </div>
              <p>© {new Date().getFullYear()} Creado por TPM</p>
              <p className="mt-1 text-xs opacity-70">Desarrollado para la comunidad</p>
            </div>

            <div className="flex flex-col items-center md:items-end">
              <p className="font-bold text-lg text-primary mb-2">Streams</p>
              <div className="flex flex-col gap-1 items-center md:items-end">
                <a href="https://kick.com/campah" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#53FC18]"></span> Kick Campah
                </a>
                <a href="https://kick.com/cerviyb" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#53FC18]"></span> Kick Cerviyb
                </a>
              </div>
            </div>

          </div>
        </footer>
      </body>
    </html>
  );
}
