import os
path = 'src/app/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('import { getDictionary } from "@/i18n/getDictionary";\n', '')
c = c.replace('  const locale = "es";\n  const t = await getDictionary(locale);\n', '')

# Replace t.home uses with hardcoded Spanish texts since translations are removed
c = c.replace('{t.home.title}', 'Bienvenido a Liga TPM')
c = c.replace('{t.home.subtitle}', 'El mejor Football Manager Online. Gana torneos, ficha jugadores y lleva a tu equipo a la gloria.')
c = c.replace('{t.home.btnCurrent}', 'Ver Torneos Actuales')
c = c.replace('{t.home.btnTeams}', 'Ver Equipos')
c = c.replace('{t.home.newsTitle}', 'Noticias (Próximamente)')
c = c.replace('{t.home.newsTag}', 'FASE ALFA')
c = c.replace('{t.home.newsHeadline}', '¡Arranca la nueva plataforma!')
c = c.replace('{t.home.newsBody}', 'Bienvenidos a la nueva página oficial de la Liga TPM Sudamerica. A partir de ahora todas las estadísticas quedarán registrados históricamente. Los datos de estas temporadas son dificiles de conseguir al 100% por eso se puso lo mas importante.')
c = c.replace('{t.home.championsTitle}', 'Máximos Campeones Históricos')
c = c.replace('{t.home.noChampions}', 'No hay campeones registrados')
c = c.replace('{t.home.seasonActive}', 'Temporada Actual')
c = c.replace('{t.home.noSeason}', 'No hay temporada activa')
c = c.replace('{t.home.discordTitle}', 'Unite a Discord')
c = c.replace('{t.home.discordSubtitle}', 'Participá con la comunidad')
c = c.replace('{t.home.streamsTitle}', 'Seguinos en Kick')
c = c.replace('{t.home.streamsSubtitle}', 'Mirá los partidos en vivo')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
