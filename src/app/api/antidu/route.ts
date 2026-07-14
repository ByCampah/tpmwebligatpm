import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { sessionId, nick, discord, fingerprint } = await req.json();

    if (!sessionId || !nick || !fingerprint) {
      return NextResponse.json({ error: "Faltan datos obligatorios (Nick o Fingerprint)" }, { status: 400 });
    }

    // Check if session exists and is OPEN
    const session = await prisma.antiDuSession.findUnique({ where: { id: sessionId } });
    if (!session || session.status !== "OPEN") {
      return NextResponse.json({ error: "La sesión no existe o está cerrada" }, { status: 400 });
    }

    // Extract IP
    const forwarded = req.headers.get("x-forwarded-for");
    let ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "127.0.0.1";
    if (ip === "::1") ip = "127.0.0.1";

    // Call external API for geolocation
    let isp = "";
    let city = "";
    let country = "";
    let zip = "";
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,zip,isp`);
      const geoData = await geoRes.json();
      if (geoData.status === "success") {
        isp = geoData.isp;
        city = geoData.city;
        country = geoData.country;
        zip = geoData.zip;
      }
    } catch (e) {
      console.error("GeoIP error:", e);
    }

    // Checking for duplicates in Firmas OR AntiDuResults
    let status = "OK";
    
    const duplicateSignature = await prisma.signature.findFirst({
      where: {
        OR: [
          { ip: ip },
          { fingerprint: fingerprint }
        ]
      }
    });

    const duplicateAntiDu = await prisma.antiDuResult.findFirst({
      where: {
        OR: [
          { ip: ip },
          { fingerprint: fingerprint }
        ],
        nick: { not: nick }
      }
    });

    if (duplicateSignature || duplicateAntiDu) {
      status = "DU";
    }

    // Check if user already submitted to this very session
    const alreadySubmitted = await prisma.antiDuResult.findFirst({
      where: {
        sessionId,
        OR: [
          { nick: nick },
          { ip: ip },
          { fingerprint: fingerprint }
        ]
      }
    });

    if (alreadySubmitted) {
      return NextResponse.json({ error: "Ya enviaste tu verificación para esta sesión" }, { status: 400 });
    }

    await prisma.antiDuResult.create({
      data: {
        sessionId,
        nick,
        discord: discord || null,
        ip,
        fingerprint,
        isp,
        city,
        country,
        zip,
        status
      }
    });

    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error("AntiDU error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
