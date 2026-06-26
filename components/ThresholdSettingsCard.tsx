import React, { useState, useEffect } from "react";
import { Sliders, Database, Key, Save, Loader2 } from "lucide-react";
import { SmartPlantData, WidgetVariant } from "../types";
import { toast } from "sonner";

const PLANT_PRESETS = [
  { id: "sayuran", label: "Sayuran & Buah", keringPct: 70, basahPct: 95, icon: "🍅" },
  { id: "hias", label: "Tanaman Hias", keringPct: 50, basahPct: 90, icon: "🌿" },
  { id: "kaktus", label: "Kaktus/Sukulen", keringPct: 20, basahPct: 40, icon: "🌵" },
  { id: "air", label: "Tanaman Air", keringPct: 80, basahPct: 100, icon: "🌾" }
];

interface ThresholdSettingsCardProps {
  telemetry: SmartPlantData;
  deviceId: string;
  publishCommand: (command: string) => void;
  variant?: WidgetVariant;
}

export default function ThresholdSettingsCard({ telemetry, deviceId, publishCommand, variant = 'default' }: ThresholdSettingsCardProps) {
  const [localBasah, setLocalBasah] = useState<number>(telemetry?.batasBasah ?? 0);
  const [localKering, setLocalKering] = useState<number>(telemetry?.batasKering ?? 4095);
  const [localCooldown, setLocalCooldown] = useState<number>(telemetry?.cooldown ?? 60);
  const [isSaving, setIsSaving] = useState(false);
  const [sliderKey, setSliderKey] = useState(0);

  const calBasah = telemetry?.calBasah ?? 0;
  const calKering = telemetry?.calKering ?? 4095;

  useEffect(() => {
    setLocalBasah(telemetry?.batasBasah ?? 0);
    setLocalKering(telemetry?.batasKering ?? 4095);
    setLocalCooldown(telemetry?.cooldown ?? 60);
    setSliderKey(prev => prev + 1);
  }, [telemetry?.batasBasah, telemetry?.batasKering, telemetry?.cooldown]);

  const applyPreset = (keringPct: number, basahPct: number) => {
    const range = calKering - calBasah;
    const newKering = Math.round(calKering - ((keringPct / 100) * range));
    const newBasah = Math.round(calKering - ((basahPct / 100) * range));
    
    setLocalBasah(newBasah);
    setLocalKering(newKering);
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

  const settingsContent = (
    <>
      <div className="flex items-center justify-between border-b border-border pb-2 mb-3 h-[40px] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-primary/10 rounded-lg border border-primary/20">
            <Sliders className="w-4 h-4 text-primary dark:text-secondary" />
          </div>
          <h3 className="font-bold text-text-primary tracking-wide text-sm">Konfigurasi Batas Kelembapan (MQTT Param)</h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          {isSaving ? (
            <span className="text-warning dark:text-amber-400 flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Auto-saving...</span>
          ) : hasChanges ? (
            <span className="text-text-secondary">Menunggu...</span>
          ) : (
            <span className="text-primary flex items-center gap-1"><Save className="w-3 h-3" /> Auto-save Aktif</span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        <div className="mb-6 flex flex-col gap-3">
          <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Quick Presets (Otomatis)</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PLANT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset.keringPct, preset.basahPct)}
                className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-800/80 hover:bg-primary/5 dark:hover:bg-primary/10 border border-border hover:border-primary/50 rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md group"
              >
                <span className="text-2xl mb-1 group-hover:scale-110 transition-transform duration-200">{preset.icon}</span>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 text-center leading-tight mb-1">{preset.label}</span>
                <div className="flex items-center gap-1 text-[9px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>{preset.keringPct}%</span>
                  <span>-</span>
                  <span>{preset.basahPct}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex justify-between text-xs">
            <span className="text-text-secondary font-medium">Batas Tanah Basah (Cukup Air)</span>
            <span className="font-mono text-primary dark:text-secondary font-bold">{localBasah}</span>
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
              className="w-full h-2 rounded-lg cursor-pointer accent-primary bg-slate-200 dark:bg-slate-800"
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
            <span className="text-text-secondary font-medium">Batas Tanah Kering (Butuh Disiram)</span>
            <span className="font-mono text-danger dark:text-rose-400 font-bold">{localKering}</span>
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
              className="w-full h-2 rounded-lg cursor-pointer accent-danger bg-slate-200 dark:bg-slate-800"
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
            <span className="text-text-secondary font-medium">Jeda Waktu Cooldown (Detik)</span>
            <span className="font-mono text-warning dark:text-amber-400 font-bold">{localCooldown} detik</span>
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
              className="w-full h-2 rounded-lg cursor-pointer accent-warning bg-slate-200 dark:bg-slate-800"
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

      <div className="mt-4 pt-3 border-t border-border flex flex-wrap justify-between items-center gap-3 text-[10px] md:text-xs mb-1">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-background/50 rounded-lg border border-border font-mono">
          <Database className="w-3.5 h-3.5 text-primary dark:text-secondary" />
          <span className="text-slate-500">Sub:</span>
          <span className="text-text-primary font-semibold">{deviceId}/telemetry</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-background/50 rounded-lg border border-border font-mono">
          <Key className="w-3.5 h-3.5 text-warning dark:text-amber-400" />
          <span className="text-slate-500">Pub:</span>
          <span className="text-text-primary font-semibold">{deviceId}/cmd</span>
        </div>
      </div>
      </div>
    </>
  );

  const renderContent = () => {
    if (variant === "minimal") {
      return (
        <section className="bg-transparent border-l-4 border-slate-500 pl-4 py-2 flex flex-col h-full pointer-events-auto relative">
          {settingsContent}
        </section>
      );
    }

    if (variant === "glassmorphism") {
      return (
        <section className="bg-surface backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] h-full flex flex-col p-5 relative overflow-hidden pointer-events-auto">
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full bg-slate-500/20 blur-2xl"></div>
          <div className="flex-1 flex flex-col relative z-10">
            {settingsContent}
          </div>
        </section>
      );
    }

    if (variant === "solid") {
      return (
        <section className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 shadow-xl h-full flex flex-col relative overflow-hidden pointer-events-auto">
          <div className="flex-1 flex flex-col relative z-10">
            {settingsContent}
          </div>
        </section>
      );
    }

    if (variant === "neon") {
      return (
        <section className="bg-background border border-slate-500/50 rounded-xl p-4 flex flex-col h-full relative overflow-hidden shadow-[0_0_15px_rgba(100,116,139,0.3),inset_0_0_20px_rgba(100,116,139,0.1)] pointer-events-auto">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-400 to-transparent opacity-70"></div>
          <div className="flex-1 flex flex-col relative z-10">
            {settingsContent}
          </div>
        </section>
      );
    }

    if (variant === "neobrutalism") {
      return (
        <section className="border-4 border-black rounded-xl p-4 flex flex-col h-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-surface pointer-events-auto">
          <div className="flex-1 flex flex-col relative">
            {settingsContent}
          </div>
        </section>
      );
    }

    if (variant === "neumorphism") {
      return (
        <section className="bg-[#e0e5ec] dark:bg-slate-800 rounded-3xl p-5 flex flex-col h-full shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(255,255,255,0.05)] border-none pointer-events-auto overflow-hidden">
          <div className="flex-1 flex flex-col relative">
            {settingsContent}
          </div>
        </section>
      );
    }

    // Default UI
    return (
      <section className="h-full flex flex-col p-4 bg-surface border border-border backdrop-blur-xl rounded-2xl shadow-xl hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300 pointer-events-auto">
        {settingsContent}
      </section>
    );
  };

  return renderContent();
}
