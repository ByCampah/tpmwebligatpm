export function getFlagUrl(nationality: string | null | undefined): string {
  if (!nationality || nationality === 'Desconocida' || nationality === 'Sin Nacionalidad') return '';

  const n = nationality.toLowerCase();
  
  if (n === 'argentina') return '/img/banderas/argentina.svg';
  if (n === 'uruguay') return '/img/banderas/uruguay.svg';
  if (n === 'brasil' || n === 'brazil') return '/img/banderas/brazil.svg';
  
  const isoMap: Record<string, string> = {
    'chile': 'cl',
    'colombia': 'co',
    'peru': 'pe',
    'perú': 'pe',
    'ecuador': 'ec',
    'paraguay': 'py',
    'bolivia': 'bo',
    'venezuela': 've',
    'méxico': 'mx',
    'mexico': 'mx',
    'estados unidos': 'us',
    'norte américa': 'us',
    'norte/centroamérica': 'us',
    'europa': 'eu',
    'españa': 'es',
    'spain': 'es',
    'resto del mundo': 'un'
  };

  if (isoMap[n]) {
    return `https://flagcdn.com/w320/${isoMap[n]}.png`;
  }

  // Fallback to 2-letter substring (which might be wrong for Chile, but works for some)
  return `https://flagcdn.com/w320/${n.substring(0, 2)}.png`;
}
