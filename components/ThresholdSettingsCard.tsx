import React, { useState, useEffect } from "react";
import { Sliders, Database, Key, Save, Loader2 } from "lucide-react";
import { SmartPlantData } from "../types";
import { toast } from "sonner";

interface ThresholdSettingsCardProps {
  telemetry: SmartPlantData;
  deviceId: string;
  publishCommand: (command: string) => void;
}

export default function ThresholdSettingsCard({ telemetry, deviceId, publishCommand }: ThresholdSettingsCardProps) {
  const [localBasah, setLocalBasah] = useState<number>(telemetry?.batasBasah ?? 0);
  const [localKering, setLocalKering] = useState<number>(telemetry?.batasKering ?? 4095);
  const [localCooldown, setLocalCooldown] = useState<number>(telemetry?.cooldown ?? 60);
  const [isSaving, setIsSaving] = useState(false);
  const [sliderKey, setSliderKey] = useState(0);

  const calBasah = telemetry?.calBasah ?? 0;
  const calKering = telemetry?.calKering ?? 4095;

  const getDynamicPresets = () => {
    const range = calKering - calBasah;
    return [
      { name: "Sayuran", basah: Math.round(calBasah + range * 0.20), kering: Math.round(calBasah + range * 0.37), icon: "🥬" },
      { name: "Tanaman Hias", basah: Math.round(calBasah + range * 0.29), kering: Math.round(calBasah + range * 0.54), icon: "🌿" },
      { name: "Kaktus", basah: Math.round(calBasah + range * 0.49), kering: Math.round(calBasah + range * 0.73), icon: "🌵" },
    ];
  };

  const dynamicPresets = getDynamicPresets();

  useEffect(() => {
    setLocalBasah(telemetry?.batasBasah ?? 0);
    setLocalKering(telemetry?.batasKering ?? 4095);
    setLocalCooldown(telemetry?.cooldown ?? 60);
    setSliderKey(prev => prev + 1);
  }, [telemetry?.batasBasah, telemetry?.batasKering, telemetry?.cooldown]);

  const applyPreset = (basah: number, kering: number) => {
    setLocalBasah(basah);
    setLocalKering(kering);
    setSliderKey(prev => prev + 1);
  };

  const hasChanges = localBasah !== (telemetry?.batasBasah ?? 0) || 
                     localKering !== (telemetry?.batasKering ?? 4095) || 
                     localCooldown !== (telemetry?.cooldown ?? 60);

  const publishRef = React.useRef(publishCommand);
  publishRef.current = publishCommand;

  useEffect(() => {
    if (!hasChanges) return;

    const timer = setTimeout(async () => {
      setIsSaving(true);
      
      let sent = false;
      if (localBasah !== (telemetry?.batasBasah ?? 0)) {
        publishRef.current(`LIMIT:BASAH:${localBasah}`);
        sent = true;
        toast.success("Batas basah berhasil diperbarui");
      }
      
      if (localKering !== (telemetry?.batasKering ?? 4095)) {
        if (sent) await new Promise(r => setTimeout(r, 500));
        publishRef.current(`LIMIT:KERING:${localKering}`);
        sent = true;
        toast.success("Batas kering berhasil diperbarui");
      }

      if (localCooldown !== (telemetry?.cooldown ?? 60)) {
        if (sent) await new Promise(r => setTimeout(r, 500));
        publishRef.current(`COOLDOWN:${localCooldown}`);
        toast.success("Waktu cooldown berhasil diperbarui");
      }
      
      setIsSaving(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [localBasah, localKering, localCooldown, telemetry?.batasBasah, telemetry?.batasKering, telemetry?.cooldown, hasChanges]);

  return (
    <section className="h-full flex flex-col p-4 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-2 mb-3 h-[40px]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-teal-500/10 rounded-lg border border-teal-500/20">
            <Sliders className="w-4 h-4 text-teal-500 dark:text-teal-400" />
          </div>
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

      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        <div className="mb-4 flex flex-col md:flex-row md:items-center gap-2">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Template Preset:</span>
        <div className="flex flex-wrap gap-2">
          {dynamicPresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(preset.basah, preset.kering)}
              className="px-4 py-1.5 bg-slate-100 dark:bg-slate-950/50 hover:bg-teal-50 dark:hover:bg-teal-900/40 border border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700/50 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-300 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{preset.icon}</span>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Batas Tanah Basah (Cukup Air)</span>
            <span className="font-mono text-emerald-500 dark:text-emerald-400 font-bold">{localBasah}</span>
          </div>
          <div className="relative pt-1">
            <input
              key={`basah-${sliderKey}`}
              type="range"
              min={telemetry?.calBasah ?? 0}
              max={telemetry?.calKering ?? 4095}
              defaultValue={localBasah}
              onChange={(e) => setLocalBasah(Number(e.target.value))}
              style={{ touchAction: 'none' }}
              className="w-full h-2 rounded-lg cursor-pointer accent-emerald-500 bg-slate-200 dark:bg-slate-800"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>{telemetry?.calBasah ?? 0} (Basah)</span>
              <span>{telemetry?.calKering ?? 4095} (Kering)</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 italic mt-1 leading-relaxed">
            * Batas Basah menentukan kapan tanah dianggap cukup lembap sehingga penyiraman dihentikan.
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
              min={telemetry?.calBasah ?? 0}
              max={telemetry?.calKering ?? 4095}
              defaultValue={localKering}
              onChange={(e) => setLocalKering(Number(e.target.value))}
              style={{ touchAction: 'none' }}
              className="w-full h-2 rounded-lg cursor-pointer accent-rose-500 bg-slate-200 dark:bg-slate-800"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>{telemetry?.calBasah ?? 0} (Basah)</span>
              <span>{telemetry?.calKering ?? 4095} (Sangat Kering)</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 italic mt-1 leading-relaxed">
            * Batas Kering mengatur seberapa kering tanah sebelum AI memutuskan untuk menyiram.
          </p>
        </div>

        <div className="space-y-4 md:col-span-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Jeda Waktu Cooldown (Detik)</span>
            <span className="font-mono text-amber-500 dark:text-amber-400 font-bold">{localCooldown} detik</span>
          </div>
          <div className="relative pt-1">
            <input
              key={`cooldown-${sliderKey}`}
              type="range"
              min={10}
              max={300}
              defaultValue={localCooldown}
              onChange={(e) => setLocalCooldown(Number(e.target.value))}
              style={{ touchAction: 'none' }}
              className="w-full h-2 rounded-lg cursor-pointer accent-amber-500 bg-slate-200 dark:bg-slate-800"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>10 detik</span>
              <span>300 detik</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 italic mt-1 leading-relaxed">
            * Mengatur waktu istirahat (cooldown) setelah pompa menyala, agar air meresap sebelum penyiraman berikutnya.
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/60 flex flex-wrap justify-between items-center gap-3 text-[10px] md:text-xs mb-1">
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
      </div>
    </section>
  );
}
