import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { deviceId, suhu, humidity, tanah, cahaya } = body;

    if (!deviceId) {
      return NextResponse.json({ success: false, error: "Missing deviceId" }, { status: 400 });
    }

    // Auto-registration: Upsert device
    const device = await prisma.device.upsert({
      where: { id: String(deviceId) },
      update: { status: "ONLINE" },
      create: {
        id: String(deviceId),
        namaAlias: `Tanaman ${String(deviceId).slice(-4)}`,
        status: "ONLINE",
      },
    });

    const sensorLog = await prisma.sensorLog.create({
      data: {
        deviceId: device.id,
        suhu: Number(suhu) || 0,
        humidity: humidity !== undefined && humidity !== null ? Number(humidity) : null,
        tanah: Number(tanah) || 0,
        cahaya: Number(cahaya) || 0,
      },
    });

    return NextResponse.json({ success: true, data: sensorLog }, { status: 201 });
  } catch (error: any) {
    console.error("Sensor POST Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get("deviceId");

    const logs = await prisma.sensorLog.findMany({
      where: deviceId ? { deviceId: String(deviceId) } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100, // Limit to 100 for performance on frontend
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    console.error("Sensor GET Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
