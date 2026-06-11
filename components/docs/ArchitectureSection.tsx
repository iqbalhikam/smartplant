import React from "react";
import { Network, Server, Smartphone, Cpu } from "lucide-react";
import ZoomableImage from "./ZoomableImage";

export default function ArchitectureSection() {
  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Arsitektur Sistem (System Architecture)</h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          SmartPlant menggunakan topologi IoT terdistribusi yang memisahkan lapisan perangkat keras fisik, lapisan komunikasi, dan lapisan antarmuka cerdas.
        </p>
      </div>

      <div className="w-full bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 relative overflow-hidden shadow-xl p-2 md:p-4">
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900">
          <ZoomableImage src="/image/diagram arsitektur.png" alt="Diagram Arsitektur SmartPlant" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl backdrop-blur-sm">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center mb-4 border border-sky-500/20">
            <Cpu className="w-5 h-5 text-sky-500" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">1. Hardware Node</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            ESP32 bertindak sebagai mikrokontroler utama yang membaca data dari sensor (Tanah, Cahaya, Suhu) dan mengontrol aktuator (Pompa Air, Lampu UV). ESP32 menyimpan data kalibrasi secara permanen.
          </p>
        </div>
        
        <div className="p-6 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl backdrop-blur-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 border border-amber-500/20">
            <Server className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">2. MQTT Broker</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            HiveMQ (MQTT Cloud) digunakan sebagai jembatan komunikasi real-time yang ringan. Menangani topik pub/sub untuk telemetri sensor dan perintah jarak jauh.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl backdrop-blur-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 border border-purple-500/20">
            <Smartphone className="w-5 h-5 text-purple-500" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">3. Frontend & AI</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Next.js (App Router) menyajikan dashboard interaktif. Terintegrasi dengan Google Gemini AI untuk memberikan analisis kondisi tanaman dan logika kontrol *Fuzzy*.
          </p>
        </div>
      </div>
    </section>
  );
}
