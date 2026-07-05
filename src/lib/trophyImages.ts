export function getTrophyImage(tournamentName: string): string {
    if (!tournamentName) return '/img/trophy-default.png';
    
    const normalized = tournamentName.toLowerCase();
    
    if (normalized.includes('supercopa')) return '/img/trofeos/SupercopaTPMNew.png';
    if (normalized.includes('promesas')) return '/img/trofeos/CopaDePromesasNew.png';
    if (normalized.includes('invierno')) return '/img/trofeos/CopaInviernoNew.png';
    if (normalized.includes('otoño') || normalized.includes('otono')) return '/img/trofeos/CopaOtoñoNew.png';
    if (normalized.includes('verano')) return '/img/trofeos/CopaVeranoNew.png';
    if (normalized.includes('primavera')) return '/img/trofeos/CopaPrimaveraNew.png';
    if (normalized.includes('copa tpm') || (normalized.includes('copa') && !normalized.includes('liga'))) return '/img/trofeos/CopaTPMNew.png';
    if (normalized.includes('liga b')) return '/img/trofeos/LigaBTPMNew.png';
    if (normalized.includes('liga tpm') || normalized.includes('liga')) return '/img/trofeos/LigaTPMNew.png';
    
    return '/img/trophy-default.png';
  }
