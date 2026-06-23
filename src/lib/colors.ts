export function getTournamentStyles(tournamentName: string, category: string) {
  const combined = `${tournamentName} ${category}`.toLowerCase();

  // Distinciones get special colors regardless of tournament
  if (combined.includes("goleador")) {
    return { textClass: "text-blue-400", bgClass: "bg-blue-500/10", borderClass: "border-blue-500/30", icon: "⚽" };
  }
  if (combined.includes("asistidor")) {
    return { textClass: "text-pink-400", bgClass: "bg-pink-500/10", borderClass: "border-pink-500/30", icon: "👟" };
  }
  if (combined.includes("gk") || combined.includes("valla")) {
    return { textClass: "text-teal-400", bgClass: "bg-teal-500/10", borderClass: "border-teal-500/30", icon: "🧤" };
  }

  // Copa TPM
  if (combined.includes("copa tpm") || combined.includes("copa")) {
    return {
      textClass: "text-green-500",
      bgClass: "bg-green-500/10",
      borderClass: "border-green-500/30",
      icon: "🏆",
      imageSrc: '/img/trofeos/CopaTPM.png'
    };
  }
  
  // Liga x8
  if (combined.includes("x8")) {
    return {
      textClass: "text-purple-500",
      bgClass: "bg-purple-500/10",
      borderClass: "border-purple-500/30",
      icon: "🏆",
      imageSrc: '/img/trofeos/LigaTPMx8.png'
    };
  }

  // Segunda División
  if (combined.includes("segunda")) {
    return {
      textClass: "text-orange-500",
      bgClass: "bg-orange-500/10",
      borderClass: "border-orange-500/30",
      icon: "🏆"
    };
  }

  // Liga TPM (Primera División)
  if (combined.includes("liga tpm") || combined.includes("liga")) {
    return {
      textClass: "text-blue-500",
      bgClass: "bg-blue-500/10",
      borderClass: "border-blue-500/30",
      icon: "🏆",
      imageSrc: '/img/trofeos/LigaTPM.png'
    };
  }

  // Default Fallback
  return {
    textClass: "text-yellow-500",
    bgClass: "bg-yellow-500/10",
    borderClass: "border-yellow-500/30",
    icon: "🏅"
  };
}

export function getTrophyCategory(trophyName: string): "CAMPEON" | "SUBCAMPEON" | "TERCER" | "DISTINCION" {
  const name = trophyName.toLowerCase();
  if (name.includes("2do") || name.includes("subcampeon") || name.includes("subcampeón")) return "SUBCAMPEON";
  if (name.includes("3ro") || name.includes("tercer") || name.includes("3er puesto")) return "TERCER";
  if (name.includes("campeon") || name.includes("campeón")) return "CAMPEON";
  return "DISTINCION";
}
