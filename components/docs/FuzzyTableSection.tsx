import React from "react";
import { Zap, Table } from "lucide-react";
import ZoomableImage from "./ZoomableImage";

export default function FuzzyTableSection() {
  const fuzzyRules = [
    { rule: "R1", tanah: "Kering", suhu: "Panas", cahaya: "Terang", pompa: "ON (Lama)", uv: "OFF" },
    { rule: "R2", tanah: "Kering", suhu: "Normal", cahaya: "Terang", pompa: "ON (Sedang)", uv: "OFF" },
    { rule: "R3", tanah: "Kering", suhu: "Dingin", cahaya: "Gelap", pompa: "ON (Sedang)", uv: "ON" },
    { rule: "R4", tanah: "Normal", suhu: "Panas", cahaya: "Terang", pompa: "ON (Sebentar)", uv: "OFF" },
    { rule: "R5", tanah: "Normal", suhu: "Normal", cahaya: "Terang", pompa: "OFF", uv: "OFF" },
    { rule: "R6", tanah: "Normal", suhu: "Dingin", cahaya: "Gelap", pompa: "OFF", uv: "ON" },
    { rule: "R7", tanah: "Basah", suhu: "Panas", cahaya: "Terang", pompa: "OFF", uv: "OFF" },
    { rule: "R8", tanah: "Basah", suhu: "Normal", cahaya: "Terang", pompa: "OFF", uv: "OFF" },
    { rule: "R9", tanah: "Basah", suhu: "Dingin", cahaya: "Gelap", pompa: "OFF", uv: "ON" },
    { rule: "R10", tanah: "Kering", suhu: "Panas", cahaya: "Gelap", pompa: "ON (Lama)", uv: "ON" },
    { rule: "R11", tanah: "Kering", suhu: "Normal", cahaya: "Gelap", pompa: "ON (Sedang)", uv: "ON" },
    { rule: "R12", tanah: "Normal", suhu: "Panas", cahaya: "Gelap", pompa: "ON (Sebentar)", uv: "ON" },
    { rule: "R13", tanah: "Normal", suhu: "Normal", cahaya: "Gelap", pompa: "OFF", uv: "ON" },
    { rule: "R14", tanah: "Basah", suhu: "Panas", cahaya: "Gelap", pompa: "OFF", uv: "ON" },
    { rule: "R15", tanah: "Basah", suhu: "Normal", cahaya: "Gelap", pompa: "OFF", uv: "ON" },
    { rule: "R16", tanah: "Kering", suhu: "Dingin", cahaya: "Terang", pompa: "ON (Sedang)", uv: "OFF" },
    { rule: "R17", tanah: "Normal", suhu: "Dingin", cahaya: "Terang", pompa: "OFF", uv: "OFF" },
    { rule: "R18", tanah: "Basah", suhu: "Dingin", cahaya: "Terang", pompa: "OFF", uv: "OFF" },
    { rule: "R19", tanah: "Kritis", suhu: "Sangat Panas", cahaya: "Terang", pompa: "ON (Maks)", uv: "OFF" },
    { rule: "R20", tanah: "Sangat Basah", suhu: "Dingin", cahaya: "Gelap", pompa: "OFF", uv: "ON" },
  ];

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Sistem Pakar (Fuzzy Logic AI)</h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          Logika Fuzzy digunakan untuk mengambil keputusan kompleks dengan memetakan nilai input analog yang tidak pasti menjadi himpunan linguistik.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">1. Fuzzifikasi</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">Mengubah nilai sensor aktual (mis: Kelembapan 45%, Suhu 30°C) menjadi variabel linguistik (Kering, Panas).</p>
        </div>
        <div className="p-5 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">2. Evaluasi Rule Base</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">Mengevaluasi himpunan fuzzy menggunakan operasi implikasi (IF-THEN) yang didefinisikan pakar.</p>
        </div>
        <div className="p-5 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">3. Defuzzifikasi</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">Menghitung Center of Area (CoA) dari output agregat untuk mendapatkan durasi aktuasi pompa.</p>
        </div>
      </div>

      <div className="w-full bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 relative overflow-hidden shadow-xl p-2 md:p-4">
        <div className="relative w-full aspect-3/4 md:aspect-9/16 lg:aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900">
          <ZoomableImage src="/image/flowchard.png" alt="Flowchart Fuzzy Logic" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Table className="w-5 h-5 text-purple-500" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200">Tabel Aturan Utama (Rule Base)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                <th className="px-6 py-3 font-semibold border-b border-slate-200 dark:border-slate-700">Kode</th>
                <th className="px-6 py-3 font-semibold border-b border-slate-200 dark:border-slate-700">Tanah</th>
                <th className="px-6 py-3 font-semibold border-b border-slate-200 dark:border-slate-700">Suhu</th>
                <th className="px-6 py-3 font-semibold border-b border-slate-200 dark:border-slate-700">Cahaya</th>
                <th className="px-6 py-3 font-semibold border-b border-slate-200 dark:border-slate-700">Pompa</th>
                <th className="px-6 py-3 font-semibold border-b border-slate-200 dark:border-slate-700">UV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {fuzzyRules.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-3 font-mono text-xs font-semibold text-purple-500">{r.rule}</td>
                  <td className="px-6 py-3 text-slate-700 dark:text-slate-300">{r.tanah}</td>
                  <td className="px-6 py-3 text-slate-700 dark:text-slate-300">{r.suhu}</td>
                  <td className="px-6 py-3 text-slate-700 dark:text-slate-300">{r.cahaya}</td>
                  <td className="px-6 py-3 font-medium text-sky-600 dark:text-sky-400">{r.pompa}</td>
                  <td className="px-6 py-3 font-medium text-amber-600 dark:text-amber-400">{r.uv}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
