import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const season = await prisma.season.findUnique({ where: { name: "Temporada 1 (2018)" }, include: { tournaments: { include: { matches: true, trophies: true, teams: true } } } });
  return NextResponse.json({ season });
}
