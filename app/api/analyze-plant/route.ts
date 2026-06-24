import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deviceId, tanah, cahaya, pompa, lampu, mode, batasKering, batasBasah } = body;

    // Check if the API key is set
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Gemini API Key belum dikonfigurasi di server. Silakan tambahkan variabel GEMINI_API_KEY ke berkas .env.local Anda." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    // Fetch historical data
    let historicalContext = "";
    if (deviceId) {
      try {
        const recentLogs = await prisma.sensorLog.findMany({
          where: { deviceId: String(deviceId) },
          orderBy: { createdAt: "desc" },
          take: 10,
        });
        if (recentLogs.length > 0) {
          historicalContext = `\n- Tren Historis (10 pembacaan terakhir, terbaru ke terlama): ${recentLogs.map((l: any) => `[Suhu: ${l.suhu}°C, Tanah: ${l.tanah}, Cahaya: ${l.cahaya}]`).join(", ")}`;
        }
      } catch (err) {
        console.error("Gagal mengambil riwayat:", err);
      }
    }

    // Prepare sensor reading description
    const moistureStatus = tanah >= batasKering ? "Kering/Haus (Butuh air segera)" : tanah <= batasBasah ? "Basah (Kandungan air cukup)" : "Normal/Lembap (Ideal)";
    const lightStatus = cahaya === 1 ? "Terang" : "Gelap";
    const pumpStatus = pompa === 1 ? "Aktif (Sedang menyiram)" : "Mati (Standby)";
    const lampStatus = lampu === 1 ? "Menyala (UV Aktif)" : "Mati";

    const prompt = `
Bertindaklah sebagai ahli botani (botanist) berpengalaman. Analisis kondisi tanaman saat ini berdasarkan data telemetry sensor IoT berikut:
- Nilai Kelembapan Tanah: ${tanah} (Batas Kering: ${batasKering}, Batas Basah: ${batasBasah}, Status: ${moistureStatus})
- Status Cahaya: ${cahaya} (${lightStatus})
- Status Pompa: ${pompa} (${pumpStatus})
- Status Lampu UV: ${lampu} (${lampStatus})
- Mode Sistem: ${mode}${historicalContext}

Persyaratan keluaran:
1. Berikan analisis singkat tentang kesehatan tanaman saat ini dan rekomendasi tindakan/penyiraman selanjutnya. Jika ada tren historis, manfaatkan untuk analisis.
2. Tuliskan dalam Bahasa Indonesia.
3. Maksimal 2 kalimat pendek saja.
4. Nada bicara santai namun ilmiah secara botani.
5. Langsung berikan hasil analisisnya tanpa kata pengantar atau kalimat pembuka seperti "Berdasarkan data..." atau "Sebagai ahli botani...".
`;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text().trim();

    return NextResponse.json({ analysis: textResponse });
  } catch (error: any) {
    console.error("Gemini AI API Error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal melakukan analisis kondisi tanaman." },
      { status: 500 }
    );
  }
}
