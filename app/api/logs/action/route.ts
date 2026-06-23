import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { deviceId, kodeRule, durasiPompaMs, lampuNyala } = body;

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

    const actionLog = await prisma.fuzzyActionLog.create({
      data: {
        deviceId: device.id,
        kodeRule: String(kodeRule || "MANUAL"),
        durasiPompaMs: Number(durasiPompaMs) || 0,
        lampuNyala: Boolean(lampuNyala),
      },
    });

    return NextResponse.json({ success: true, data: actionLog }, { status: 201 });
  } catch (error: any) {
    console.error("Action POST Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get("deviceId");

    const logs = await prisma.fuzzyActionLog.findMany({
      where: deviceId ? { deviceId: String(deviceId) } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    console.error("Action GET Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
