import React from "react";
import { Cpu, Zap } from "lucide-react";

export default function HardwareSection() {
  const pinouts = [
    { name: "Sensor Kelembapan Tanah", type: "Analog Input", pin: "GPIO 34", color: "border-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-500" },
    { name: "Sensor Cahaya (LDR)", type: "Digital / Analog", pin: "GPIO 33", color: "border-amber-500", bg: "bg-amber-500/10", text: "text-amber-500" },
    { name: "Sensor Suhu (DHT11)", type: "Digital Input", pin: "GPIO 15", color: "border-orange-500", bg: "bg-orange-500/10", text: "text-orange-500" },
    { name: "Relay Pompa Air", type: "Digital Output (Active Low)", pin: "GPIO 26", color: "border-sky-500", bg: "bg-sky-500/10", text: "text-sky-500" },
    { name: "Relay Lampu UV", type: "Digital Output (Active Low)", pin: "GPIO 27", color: "border-purple-500", bg: "bg-purple-500/10", text: "text-purple-500" },
    { name: "Sensor Water Level", type: "Analog Input", pin: "GPIO 32", color: "border-blue-500", bg: "bg-blue-500/10", text: "text-blue-500" },
  ];

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Pinout & Hardware</h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          Sistem SmartPlant menggunakan ESP32 sebagai pusat pemrosesan dengan berbagai sensor dan aktuator yang dihubungkan sesuai pemetaan pinout berikut.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pinouts.map((item, idx) => (
          <div key={idx} className="p-4 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
            <div className={`p-3 rounded-xl border ${item.color} ${item.bg}`}>
              {idx > 2 ? <Zap className={`w-5 h-5 ${item.text}`} /> : <Cpu className={`w-5 h-5 ${item.text}`} />}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200">{item.name}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.type}</p>
              <div className="mt-2 inline-flex items-center px-2 py-1 rounded-md text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Pin: {item.pin}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-6 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-600 dark:text-slate-400 italic">
        <p>Catatan: Relay menggunakan logika Active Low, sehingga pemberian sinyal LOW (0) pada pin GPIO akan mengaktifkan relay, dan sinyal HIGH (1) akan mematikannya.</p>
      </div>
    </section>
  );
}
