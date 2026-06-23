"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LanguageSwitcher() {
  const router = useRouter();
  const [locale, setLocale] = useState<string>("es");

  useEffect(() => {
    // Get current locale from cookie
    const cookies = document.cookie.split("; ");
    const localeCookie = cookies.find(row => row.startsWith("locale="));
    if (localeCookie) {
      setLocale(localeCookie.split("=")[1]);
    }
  }, []);

  const changeLanguage = (newLocale: string) => {
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`; // 1 year
    setLocale(newLocale);
    
    // Disparar un evento para que los Client Components se enteren
    const event = new Event("languageChanged");
    window.dispatchEvent(event);
    
    // No recargamos para que siga siendo rapido si solo cambian los client components, 
    // pero si queremos que toda la pagina estatica intente recargar:
    router.refresh(); 
  };

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={() => changeLanguage("es")}
        className={`w-8 h-6 rounded overflow-hidden border-2 transition-all ${locale === "es" ? "border-primary scale-110 shadow-lg" : "border-transparent opacity-50 hover:opacity-100"}`}
        title="Español"
      >
        <img src="/img/banderas/argentina.svg" alt="Argentina" className="w-full h-full object-cover" />
      </button>
      <button 
        onClick={() => changeLanguage("en")}
        className={`w-8 h-6 rounded overflow-hidden border-2 transition-all ${locale === "en" ? "border-primary scale-110 shadow-lg" : "border-transparent opacity-50 hover:opacity-100"}`}
        title="English"
      >
        <img src="https://flagcdn.com/w40/us.png" alt="USA" className="w-full h-full object-cover" />
      </button>
      <button 
        onClick={() => changeLanguage("pt")}
        className={`w-8 h-6 rounded overflow-hidden border-2 transition-all ${locale === "pt" ? "border-primary scale-110 shadow-lg" : "border-transparent opacity-50 hover:opacity-100"}`}
        title="Português"
      >
        <img src="/img/banderas/brazil.svg" alt="Brasil" className="w-full h-full object-cover" />
      </button>
    </div>
  );
}
