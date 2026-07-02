import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Fetch all tables
    const [
      users, accounts, sessions, verificationTokens,
      players, teams, seasons, categories, tournaments,
      tournamentTeams, tournamentPlayers, matches, matchStats,
      trophies, news, adminLogs
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.account.findMany(),
      prisma.session.findMany(),
      prisma.verificationToken.findMany(),
      prisma.player.findMany(),
      prisma.team.findMany(),
      prisma.season.findMany(),
      prisma.category.findMany(),
      prisma.tournament.findMany(),
      prisma.tournamentTeam.findMany(),
      prisma.tournamentPlayer.findMany(),
      prisma.match.findMany(),
      prisma.matchStat.findMany(),
      prisma.trophy.findMany(),
      prisma.news.findMany(),
      prisma.adminLog.findMany(),
    ]);

    const backup = {
      timestamp: new Date().toISOString(),
      data: {
        users, accounts, sessions, verificationTokens,
        players, teams, seasons, categories, tournaments,
        tournamentTeams, tournamentPlayers, matches, matchStats,
        trophies, news, adminLogs
      }
    };

    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="backup_ligatpm_${new Date().toISOString().split('T')[0]}.json"`
      }
    });

  } catch (error) {
    console.error('Backup failed:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
