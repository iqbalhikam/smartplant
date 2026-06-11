import React from "react";
import { Sliders, Save, Database } from "lucide-react";

export default function CalibrationSection() {
  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Fitur Kalibrasi Dinamis</h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          Kalibrasi dinamis memungkinkan pembacaan sensor kelembapan tanah yang akurat tanpa batasan fisik perangkat keras (0-4095).
        </p>
      </div>

      <div className="space-y-6">
        <div className="p-6 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <Sliders className="w-6 h-6 text-teal-500" />
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Mengapa Kalibrasi Diperlukan?</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Sensor kelembapan tanah kapasitif membaca tegangan analog dalam rentang ADC 12-bit (0 - 4095). Namun, di dunia nyata, 
            kondisi tanah yang sepenuhnya kering jarang mencapai batas absolut 4095, begitu juga dengan tanah sepenuhnya basah tidak pernah mencapai 0 mutlak. 
            Tanpa kalibrasi, perhitungan persentase akan skewed atau tidak merepresentasikan kondisi aktual.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-indigo-500" />
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Penyimpanan di ESP32 NVS (Non-Volatile Storage)</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Meskipun antarmuka Wizard Kalibrasi ada di Frontend, nilai calKering dan calBasah dikirimkan ke ESP32 melalui 
            protokol MQTT dan disimpan secara permanen di dalam IC Flash (menggunakan pustaka Preferences/EEPROM). Ini memastikan 
            bahwa ESP32 menggunakan batas yang sama saat menjalankan Fuzzy Logic secara offline di perangkat keras, dan memancarkan 
            nilai kalibrasi konstan pada payload telemetri.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <Save className="w-6 h-6 text-emerald-500" />
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Interpolasi Data</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            Frontend menerima calKering dan calBasah dari MQTT. Kemudian, nilai pembacaan tanah aktual (misalnya: 2100) akan 
            diinterpolasi ke dalam skala persentase 0-100% secara proporsional.
          </p>
          <div className="p-4 bg-slate-900 rounded-xl text-emerald-400 font-mono text-xs overflow-x-auto">
            <pre><code>
{`const cBasah = telemetry?.calBasah ?? 0;
const cKering = telemetry?.calKering ?? 4095;

const clampedValue = Math.max(cBasah, Math.min(cKering, tanah));
const percentage = Math.round(
  ((cKering - clampedValue) / (cKering - cBasah || 1)) * 100
);`}
            </code></pre>
          </div>
        </div>
      </div>
    </section>
  );
}
