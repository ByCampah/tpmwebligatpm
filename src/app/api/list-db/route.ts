import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const seasons = await prisma.season.findMany();
  const teams = await prisma.team.findMany();
  return NextResponse.json({ seasons, teams });
}
