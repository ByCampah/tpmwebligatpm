import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { lobbyId, fingerprint } = await req.json();

    if (!lobbyId || !fingerprint) {
      return NextResponse.json({ error: "Faltan datos (lobbyId o fingerprint)" }, { status: 400 });
    }

    // Check if lobby exists and is OPEN
    const lobby = await prisma.signatureLobby.findUnique({ where: { id: lobbyId } });
    if (!lobby || lobby.status !== "OPEN") {
      return NextResponse.json({ error: "La sala no existe o está cerrada" }, { status: 400 });
    }

    // Extract IP
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1"; // local fallback

    // Geolocation from IP
    let country = "Desconocido";
    let city = "Desconocido";
    let isp = "Desconocido";
    let zip: string | null = null;
    let lat: number | null = null;
    let lon: number | null = null;
    let isProxy = false;
    let isHosting = false;
    let isMobile = false;

    if (ip && ip !== "127.0.0.1" && ip !== "::1") {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=country,city,zip,isp,lat,lon,proxy,hosting,mobile,status&lang=es`);
        const geoData = await geoRes.json();
        if (geoData.status === "success") {
          country = geoData.country || "Desconocido";
          city = geoData.city || "Desconocido";
          isp = geoData.isp || "Desconocido";
          zip = geoData.zip || null;
          lat = geoData.lat !== undefined ? geoData.lat : null;
          lon = geoData.lon !== undefined ? geoData.lon : null;
          isProxy = !!geoData.proxy;
          isHosting = !!geoData.hosting;
          isMobile = !!geoData.mobile;
        }
      } catch (err) {
        console.error("Geo error:", err);
      }
    }

    // Save Signature
    const signature = await prisma.signature.upsert({
      where: {
        lobbyId_userId: {
          lobbyId: lobbyId,
          userId: session.user.id
        }
      },
      update: {
        ip,
        fingerprint,
        country,
        city,
        isp,
        zip,
        lat,
        lon,
        isProxy,
        isHosting,
        isMobile
      },
      create: {
        lobbyId,
        userId: session.user.id,
        ip,
        fingerprint,
        country,
        city,
        isp,
        zip,
        lat,
        lon,
        isProxy,
        isHosting,
        isMobile
      }
    });

    return NextResponse.json({ success: true, signature });
  } catch (error) {
    console.error("Error signing:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
