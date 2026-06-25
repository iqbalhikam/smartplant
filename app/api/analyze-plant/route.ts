import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deviceId, tanah, cahaya, pompa, lampu, mode, batasKering, batasBasah, aiModel } = body;

    // Check if the API key is set
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Gemini API Key belum dikonfigurasi di server. Silakan tambahkan variabel GEMINI_API_KEY ke berkas .env.local Anda." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = aiModel || "gemini-2.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    // Fetch historical data
    let historicalContext = "";
    let deviceName = "Tanaman (Tidak diketahui)";
    
    if (deviceId) {
      try {
        const device = await prisma.device.findUnique({
          where: { id: String(deviceId) },
          select: { namaAlias: true }
        });
        if (device) deviceName = device.namaAlias;

        const recentLogs = await prisma.sensorLog.findMany({
          where: { deviceId: String(deviceId) },
          orderBy: { createdAt: "desc" },
          take: 5,
        });

        const recentActions = await prisma.fuzzyActionLog.findMany({
          where: { deviceId: String(deviceId) },
          orderBy: { createdAt: "desc" },
          take: 3,
        });

        const recentAlerts = await prisma.systemAlert.findMany({
          where: { deviceId: String(deviceId) },
          orderBy: { createdAt: "desc" },
          take: 2,
        });

        historicalContext += `\n- Profil Tanaman: ${deviceName}`;
        
        if (recentLogs.length > 0) {
          historicalContext += `\n- Tren Sensor (5 terakhir): ${recentLogs.map((l: any) => `[Suhu: ${l.suhu}°C, Tanah: ${l.tanah}, Cahaya: ${l.cahaya}]`).join(", ")}`;
        }
        
        if (recentActions.length > 0) {
          historicalContext += `\n- Riwayat Tindakan Otomatis (3 terakhir): ${recentActions.map((a: any) => `[Rule: ${a.kodeRule}, Pompa: ${a.durasiPompaMs}ms, UV: ${a.lampuNyala ? 'Ya' : 'Tidak'}]`).join(", ")}`;
        }

        if (recentAlerts.length > 0) {
          historicalContext += `\n- Peringatan Sistem Terakhir: ${recentAlerts.map((a: any) => `[${a.tipe}: ${a.pesan}]`).join(", ")}`;
        }
      } catch (err) {
        console.error("Gagal mengambil riwayat DB:", err);
      }
    }

    // Prepare sensor reading description
    const moistureStatus = tanah >= batasKering ? "Kering/Haus (Butuh air segera)" : tanah <= batasBasah ? "Basah (Kandungan air cukup)" : "Normal/Lembap (Ideal)";
    const lightStatus = cahaya === 1 ? "Terang" : "Gelap";
    const pumpStatus = pompa === 1 ? "Aktif (Sedang menyiram)" : "Mati (Standby)";
    const lampStatus = lampu === 1 ? "Menyala (UV Aktif)" : "Mati";

    const prompt = `
Bertindaklah sebagai Ahli Botani (Botanist) Senior dan Analis Sistem IoT. Analisis kondisi tanaman "${deviceName}" saat ini berdasarkan data telemetry dan database berikut:

DATA SAAT INI:
- Kelembapan Tanah: ${tanah} (Batas Kering: ${batasKering}, Batas Basah: ${batasBasah}, Status: ${moistureStatus})
- Cahaya: ${cahaya} (${lightStatus})
- Pompa: ${pompa} (${pumpStatus})
- Lampu UV: ${lampu} (${lampStatus})
- Mode Sistem: ${mode}

KONTEKS HISTORIS (Database):${historicalContext}

PERSYARATAN KELUARAN (FORMAT MARKDOWN):
1. **Status Kesehatan**: Berikan 1 kalimat penilaian singkat tentang kondisi keseluruhan tanaman.
2. **Analisis Lingkungan**: Evaluasi singkat kelembapan tanah & cahaya (serta perhatikan tren historis jika ada).
3. **Evaluasi Sistem IoT**: Nilai kinerja sistem otomatis (pompa/lampu) atau peringatan terakhir. Apakah bekerja sesuai kebutuhan tanaman?
4. **Rekomendasi Praktis**: Langkah spesifik yang perlu dilakukan pengguna.

Gunakan bahasa Indonesia yang profesional, ramah, dan ringkas. WAJIB gunakan format Markdown (Heading, Bullet list, Bold, Italic, atau Emoji yang elegan). Langsung berikan hasil tanpa kalimat basa-basi.
`;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text().trim();

    return NextResponse.json({ analysis: textResponse });
  } catch (error: any) {
    console.error("Gemini AI API Error:", error);
    
    let errorMessage = "Gagal melakukan analisis kondisi tanaman.";
    let statusCode = 500;
    
    if (error.status === 429 || (error.message && (error.message.includes("429") || error.message.includes("Quota exceeded")))) {
      errorMessage = "Kuota API Gemini (Free Tier) untuk model ini telah habis. Silakan gunakan model yang lebih ringan (misal: 2.5 Flash) atau coba lagi nanti.";
      statusCode = 429;
    } else {
      errorMessage = error.message || errorMessage;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
