import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const devices = await prisma.device.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: devices });
  } catch (error: any) {
    console.error("Failed to fetch devices:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
