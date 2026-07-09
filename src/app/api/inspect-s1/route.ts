import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const seasons = await prisma.season.findMany({
    where: { name: "Temporada 1 (2018)" },
    include: {
      tournaments: {
        include: {
          matches: { include: { stats: true } },
          teams: true,
          trophies: true
        }
      }
    }
  });

  return NextResponse.json({ seasons });
}
