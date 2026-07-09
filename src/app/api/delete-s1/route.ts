import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const s = await prisma.season.findUnique({ where: { name: "Temporada 1 (2018)" }});
    if (s) {
      await prisma.season.delete({ where: { id: s.id }});
    }
    return NextResponse.json({ success: true, message: "Season 1 deleted" });
  } catch(e:any) {
    return NextResponse.json({ error: e.message });
  }
}
