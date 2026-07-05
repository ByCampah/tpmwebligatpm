export function getTournamentStyles(trophyName: string, tournamentName: string) {
  const combined = `${trophyName} ${tournamentName}`.toLowerCase();
  const isCampeon = combined.includes("campeon") || combined.includes("campeón");
  const isSub = combined.includes("subcampeon") || combined.includes("subcampeón");
  const isFirstPlace = isCampeon && !isSub;

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

  // Supercopa TPM
  if (combined.includes("supercopa")) {
    return {
      textClass: "text-red-500",
      bgClass: "bg-red-500/10",
      borderClass: "border-red-500/30",
      icon: "🏆",
      ...(isFirstPlace && { imageSrc: '/img/trofeos/SupercopaTPMNew.png' })
    };
  }

  // Copa de Promesas
  if (combined.includes("promesas")) {
    return {
      textClass: "text-emerald-500",
      bgClass: "bg-emerald-500/10",
      borderClass: "border-emerald-500/30",
      icon: "🏆",
      ...(isFirstPlace && { imageSrc: '/img/trofeos/CopaDePromesasNew.png' })
    };
  }

  // Copa TPM
  if (combined.includes("copa tpm") || combined.includes("copa")) {
    return {
      textClass: "text-green-500",
      bgClass: "bg-green-500/10",
      borderClass: "border-green-500/30",
      icon: "🏆",
      ...(isFirstPlace && { imageSrc: '/img/trofeos/CopaTPMNew.png' })
    };
  }
  
  // Liga x8
  if (combined.includes("x8")) {
    return {
      textClass: "text-purple-500",
      bgClass: "bg-purple-500/10",
      borderClass: "border-purple-500/30",
      icon: "🏆",
      ...(isFirstPlace && { imageSrc: '/img/trofeos/LigaTPMx8.png' })
    };
  }

  // Nacional B (Segunda División)
  if (combined.includes("segunda") || combined.includes("nacional b") || combined.includes("nacional")) {
    return {
      textClass: "text-orange-500",
      bgClass: "bg-orange-500/10",
      borderClass: "border-orange-500/30",
      icon: "🏆",
      ...(isFirstPlace && { imageSrc: '/img/trofeos/LigaBTPMNew.png' })
    };
  }

  // Liga TPM (Primera División)
  if (combined.includes("liga tpm") || combined.includes("liga") || combined.includes("primera")) {
    return {
      textClass: "text-blue-500",
      bgClass: "bg-blue-500/10",
      borderClass: "border-blue-500/30",
      icon: "🏆",
      ...(isFirstPlace && { imageSrc: '/img/trofeos/LigaTPMNew.png' })
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

export function formatTrophyName(name: string): string {
  const lower = name.toLowerCase();
  const isSub = lower.includes("subcampeon") || lower.includes("subcampeón") || lower.includes("2do") || lower.includes("segundo");
  const isThird = lower.includes("tercer") || lower.includes("3ro") || lower.includes("3er");
  const isFirst = lower.includes("campeon") || lower.includes("campeón") || lower.includes("1er");

  if (isSub) return "Subcampeón";
  if (isThird) return "Tercer Puesto";
  if (isFirst) return "Campeón";
  return name;
}

export function getTrophyCategory(trophyName: string): "CAMPEON" | "SUBCAMPEON" | "TERCER" | "DISTINCION" {
  const name = trophyName.toLowerCase();
  if (name.includes("2do") || name.includes("subcampeon") || name.includes("subcampeón")) return "SUBCAMPEON";
  if (name.includes("3ro") || name.includes("tercer") || name.includes("3er puesto")) return "TERCER";
  if (name.includes("campeon") || name.includes("campeón")) return "CAMPEON";
  return "DISTINCION";
}
