export function getTrophyImage(tournamentName: string | undefined): string | null {
  if (!tournamentName) return null;

  const normalized = tournamentName.toLowerCase();
  
  if (normalized.includes('supercopa')) {
    return '/img/trofeos/SupercopaTPMNew.png';
  }
  if (normalized.includes('promesas')) {
    return '/img/trofeos/CopaDePromesasNew.png';
  }
  if (normalized.includes('copa tpm') || (normalized.includes('copa') && !normalized.includes('liga'))) {
    return '/img/trofeos/CopaTPMNew.png';
  }
  if (normalized.includes('liga b')) {
    return '/img/trofeos/LigaBTPMNew.png';
  }
  if (normalized.includes('liga tpm') || normalized.includes('liga')) {
    return '/img/trofeos/LigaTPMNew.png';
  }
  
  return null;
}
