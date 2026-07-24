export function getThemeColors(theme: string) {
  switch (theme) {
    case 'red':
      return {
        primary: '#DC2626', // red-600
        secondary: '#EA580C', // orange-600
        bgGradient: 'linear-gradient(to bottom right, #0a0a0a, #111, #2a0a0a)',
        orb1: 'rgba(220, 38, 38, 0.15)',
        orb2: 'rgba(234, 88, 12, 0.15)',
        twOrb1: 'bg-red-600/20',
        twOrb2: 'bg-orange-600/20',
      };
    case 'blue':
      return {
        primary: '#2563EB', // blue-600
        secondary: '#0891B2', // cyan-600
        bgGradient: 'linear-gradient(to bottom right, #0a0a0a, #111, #0a152a)',
        orb1: 'rgba(37, 99, 235, 0.15)',
        orb2: 'rgba(8, 145, 178, 0.15)',
        twOrb1: 'bg-blue-600/20',
        twOrb2: 'bg-cyan-600/20',
      };
    case 'purple':
      return {
        primary: '#9333EA', // purple-600
        secondary: '#DB2777', // pink-600
        bgGradient: 'linear-gradient(to bottom right, #0a0a0a, #111, #1e0a2a)',
        orb1: 'rgba(147, 51, 234, 0.15)',
        orb2: 'rgba(219, 39, 119, 0.15)',
        twOrb1: 'bg-purple-600/20',
        twOrb2: 'bg-pink-600/20',
      };
    case 'gold':
      return {
        primary: '#D4AF37', // gold
        secondary: '#B45309', // amber-700
        bgGradient: 'linear-gradient(to bottom right, #0a0a0a, #111, #2a200a)',
        orb1: 'rgba(212, 175, 55, 0.15)',
        orb2: 'rgba(180, 83, 9, 0.15)',
        twOrb1: 'bg-yellow-500/20',
        twOrb2: 'bg-amber-600/20',
      };
    case 'emerald':
    default:
      return {
        primary: '#10B981', // emerald-500
        secondary: '#3B82F6', // blue-500
        bgGradient: 'linear-gradient(to bottom right, #0a0a0a, #111, #0a2a1a)',
        orb1: 'rgba(16, 185, 129, 0.15)',
        orb2: 'rgba(59, 130, 246, 0.15)',
        twOrb1: 'bg-emerald-600/20',
        twOrb2: 'bg-blue-700/20',
      };
  }
}
