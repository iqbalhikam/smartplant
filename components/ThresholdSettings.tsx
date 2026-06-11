import React, { useState, useEffect } from "react";
import { Sliders, Database, Key, Save, Loader2 } from "lucide-react";
import { SmartPlantData } from "../types";
import { toast } from "sonner";

const PRESETS = [
  { name: "Sayuran", basah: 800, kering: 1500, icon: "🥬" },
  { name: "Tanaman Hias", basah: 1200, kering: 2200, icon: "🌿" },
  { name: "Kaktus", basah: 2000, kering: 3000, icon: "🌵" },
];

interface ThresholdSettingsProps {
  telemetry: SmartPlantData;
  deviceId: string;
  publishCommand: (command: string) => void;
}

export default function ThresholdSettings({ telemetry, deviceId, publishCommand }: ThresholdSettingsProps) {
  const [localBasah, setLocalBasah] = useState<number>(telemetry.batasBasah);
  const [localKering, setLocalKering] = useState<number>(telemetry.batasKering);
  const [isSaving, setIsSaving] = useState(false);
  const [sliderKey, setSliderKey] = useState(0);

  useEffect(() => {
    setLocalBasah(telemetry.batasBasah);
    setLocalKering(telemetry.batasKering);
    setSliderKey(prev => prev + 1);
  }, [telemetry.batasBasah, telemetry.batasKering]);

  const applyPreset = (basah: number, kering: number) => {
    setLocalBasah(basah);
    setLocalKering(kering);
    setSliderKey(prev => prev + 1);
  };

  const hasChanges = localBasah !== telemetry.batasBasah || localKering !== telemetry.batasKering;

  const publishRef = React.useRef(publishCommand);
  publishRef.current = publishCommand;

  useEffect(() => {
    if (!hasChanges) return;

    const timer = setTimeout(async () => {
      setIsSaving(true);
      
      let sent = false;
      if (localBasah !== telemetry.batasBasah) {
        publishRef.current(`LIMIT:BASAH:${localBasah}`);
        sent = true;
      }
      
      if (localKering !== telemetry.batasKering) {
        if (sent) await new Promise(r => setTimeout(r, 500));
        publishRef.current(`LIMIT:KERING:${localKering}`);
      }
      
      setIsSaving(false);
      toast.success("Konfigurasi tersimpan otomatis!");
    }, 1000);

    return () => clearTimeout(timer);
  }, [localBasah, localKering, telemetry.batasBasah, telemetry.batasKering, hasChanges]);

  return (
    <section className="p-6 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-3 mb-4 h-[44px]">
        <div className="flex items-center gap-2.5">
          <Sliders className="w-4 h-4 text-teal-500 dark:text-teal-400" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 tracking-wide text-sm">Konfigurasi Batas Kelembapan (MQTT Param)</h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          {isSaving ? (
            <span className="text-amber-500 dark:text-amber-400 flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Auto-saving...</span>
          ) : hasChanges ? (
            <span className="text-slate-500 dark:text-slate-400">Menunggu...</span>
          ) : (
            <span className="text-teal-500 flex items-center gap-1"><Save className="w-3 h-3" /> Auto-save Aktif</span>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-3">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Template Preset:</span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(preset.basah, preset.kering)}
              className="px-4 py-1.5 bg-slate-100 dark:bg-slate-950/50 hover:bg-teal-50 dark:hover:bg-teal-900/40 border border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700/50 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-300 transition-all flex items-center gap-2"
            >
              <span>{preset.icon}</span>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Batas Tanah Basah (Cukup Air)</span>
            <span className="font-mono text-emerald-500 dark:text-emerald-400 font-bold">{localBasah}</span>
          </div>
          <div className="relative pt-1">
            <input
              key={`basah-${sliderKey}`}
              type="range"
              min="0"
              max={Math.max(0, localKering - 50)}
              defaultValue={localBasah}
              onChange={(e) => setLocalBasah(Number(e.target.value))}
              style={{ touchAction: 'none' }}
              className="w-full h-2 rounded-lg cursor-pointer accent-emerald-500 bg-slate-200 dark:bg-slate-800"
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
            <span className="text-slate-600 dark:text-slate-400 font-medium">Batas Tanah Kering (Butuh Disiram)</span>
            <span className="font-mono text-rose-500 dark:text-rose-400 font-bold">{localKering}</span>
          </div>
          <div className="relative pt-1">
            <input
              key={`kering-${sliderKey}`}
              type="range"
              min={Math.min(4095, localBasah + 50)}
              max="4095"
              defaultValue={localKering}
              onChange={(e) => setLocalKering(Number(e.target.value))}
              style={{ touchAction: 'none' }}
              className="w-full h-2 rounded-lg cursor-pointer accent-rose-500 bg-slate-200 dark:bg-slate-800"
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

      <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800/60 flex flex-wrap justify-between items-center gap-3 text-[10px] md:text-xs">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-slate-800/60 font-mono">
          <Database className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          <span className="text-slate-500">Sub:</span>
          <span className="text-slate-700 dark:text-slate-300 font-semibold">{deviceId}/telemetry</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-slate-800/60 font-mono">
          <Key className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          <span className="text-slate-500">Pub:</span>
          <span className="text-slate-700 dark:text-slate-300 font-semibold">{deviceId}/cmd</span>
        </div>
      </div>
    </section>
  );
}
