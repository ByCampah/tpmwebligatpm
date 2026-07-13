"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import dictionaries from "@/i18n/dictionaries";

export default function ClientNavbar() {
  const [locale, setLocale] = useState<"es" | "en" | "pt">("es");

  useEffect(() => {
    const cookies = document.cookie.split("; ");
    const localeCookie = cookies.find(row => row.startsWith("locale="));
    if (localeCookie) {
      const val = localeCookie.split("=")[1];
      if (val === "es" || val === "en" || val === "pt") {
        setLocale(val);
      }
    }
  }, []);

  // Escuchar cambios de idioma que LanguageSwitcher puede emitir
  useEffect(() => {
    const handleLanguageChange = () => {
      const cookies = document.cookie.split("; ");
      const localeCookie = cookies.find(row => row.startsWith("locale="));
      if (localeCookie) {
        const val = localeCookie.split("=")[1];
        if (val === "es" || val === "en" || val === "pt") {
          setLocale(val);
        }
      }
    };
    window.addEventListener("languageChanged", handleLanguageChange);
    return () => window.removeEventListener("languageChanged", handleLanguageChange);
  }, []);

  const t = dictionaries[locale] || dictionaries.es;

  const links: { name: string; href: string; comingSoon?: boolean }[] = [
    { name: t.nav.home, href: '/' },
    { name: t.nav.news, href: '/noticias' },
    { name: t.nav.league, href: '/liga' },
    { name: t.nav.history, href: '/historial' },
    { name: "Pretemporada", href: '/extras' },
    { name: "Challenges", href: '/challenges' },
    { name: "Trofeos", href: '/trofeos' },
    { name: "Selecciones", href: '/selecciones' },
    { name: t.nav.teams, href: '/equipos' },
    { name: t.nav.players, href: '/jugadores' },
    { name: t.nav.market, href: '/mercado' },
  ];

  return (
    <>
      <div className="flex-1 flex justify-center hidden lg:flex">
        <nav className="flex gap-4 xl:gap-6 items-center">
          {links.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className="relative text-sm xl:text-base font-semibold text-muted-foreground hover:text-primary transition-colors py-2 group flex flex-col items-center"
            >
              <div className="flex items-center gap-1">
                {link.name.replace(" (Próximamente)", "").replace(" (Em breve)", "").replace(" (Coming Soon)", "")}
              </div>
              {link.comingSoon && (
                <span className="text-[10px] text-primary/80 uppercase font-black tracking-widest leading-none mt-1">
                  {locale === 'es' ? 'Pronto' : locale === 'en' ? 'Soon' : 'Em breve'}
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
            {t.nav.login.replace(" (Próximamente)", "").replace(" (Em breve)", "").replace(" (Coming Soon)", "")}
          </span>
          <span className="text-[10px] text-primary/80 uppercase font-black tracking-widest leading-none mt-1">
            {locale === 'es' ? 'Pronto' : locale === 'en' ? 'Soon' : 'Em breve'}
          </span>
        </div>
      </div>
    </>
  );
}
