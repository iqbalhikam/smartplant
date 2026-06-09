import React from "react";
import { Sliders, Database, Key } from "lucide-react";
import { SmartPlantData } from "../types";

interface ThresholdSettingsProps {
  telemetry: SmartPlantData;
  deviceId: string;
}

export default function ThresholdSettings({ telemetry, deviceId }: ThresholdSettingsProps) {
  return (
    <section className="mt-8 p-6 bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl hover:border-slate-700/80 transition-all duration-300">
      <div className="flex items-center gap-2.5 border-b border-slate-800/60 pb-3 mb-4">
        <Sliders className="w-4 h-4 text-teal-400" />
        <h3 className="font-bold text-slate-200 tracking-wide text-sm">Konfigurasi Batas Kelembapan (MQTT Param)</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 font-medium">Batas Tanah Basah (Cukup Air)</span>
            <span className="font-mono text-emerald-400 font-bold">{telemetry.batasBasah}</span>
          </div>
          <div className="relative pt-1">
            <input
              type="range"
              min="0"
              max="4095"
              disabled
              value={telemetry.batasBasah}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 opacity-60"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>0 (Sangat Basah)</span>
              <span>4095 (Kering)</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 italic mt-1">
            * Sistem menyetop penyiraman saat sensor membaca kelembapan melampaui level basah ini.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 font-medium">Batas Tanah Kering (Butuh Disiram)</span>
            <span className="font-mono text-rose-400 font-bold">{telemetry.batasKering}</span>
          </div>
          <div className="relative pt-1">
            <input
              type="range"
              min="0"
              max="4095"
              disabled
              value={telemetry.batasKering}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500 opacity-60"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>0 (Basah)</span>
              <span>4095 (Sangat Kering)</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 italic mt-1">
            * Sistem otomatis memicu pompa menyala saat sensor membaca kelembapan menyusut melewati level kering ini.
          </p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/60 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-500 font-mono">
          <Database className="w-3.5 h-3.5" />
          <span>Topic Sub: </span>
          <span className="text-slate-300 font-bold">"{deviceId}/telemetry"</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 font-mono">
          <Key className="w-3.5 h-3.5" />
          <span>Topic Pub: </span>
          <span className="text-slate-300 font-bold">"{deviceId}/cmd"</span>
        </div>
      </div>
    </section>
  );
}
