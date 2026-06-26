import React, { useState, useEffect } from "react";
import { Clock, Save, Settings2 } from "lucide-react";
import { motion } from "framer-motion";
import { SmartPlantData, WidgetVariant } from "../types";
import { toast } from "sonner";
import { Crosshair } from "lucide-react";
import CalibrationWizardModal from "./CalibrationWizardModal";

interface PumpCalibrationCardProps {
  telemetry: SmartPlantData;
  publishCommand: (command: string) => void;
  variant?: WidgetVariant;
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
};

export default function PumpCalibrationCard({ telemetry, publishCommand, variant }: PumpCalibrationCardProps) {
  const [baseDurasi, setBaseDurasi] = useState<number>(10);
  const [calibrationModalOpen, setCalibrationModalOpen] = useState(false);
  
  // Update state from telemetry if available
  useEffect(() => {
    if (telemetry.baseDurasi !== undefined) {
      setBaseDurasi(telemetry.baseDurasi / 1000);
    }
  }, [telemetry.baseDurasi]);

  const handleSave = () => {
    publishCommand(`DURASI:BASE:${baseDurasi * 1000}`);
    toast.success(`Kalibrasi Base Duration disimpan: ${baseDurasi} detik`);
  };

  const handleSliderRelease = (value: number) => {
    publishCommand(`DURASI:BASE:${value * 1000}`);
    toast.success(`Base Duration diperbarui: ${value} detik`);
  };

  const calibrationContent = (
    <>
      <div className="flex items-center justify-between border-b border-white/50 dark:border-white/10 pb-2 mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg border border-primary/20">
            <Settings2 className="w-4 h-4 text-primary dark:text-secondary" />
          </div>
          <h3 className="font-bold text-text-primary tracking-wide text-xs">Pusat Kalibrasi Perangkat</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col justify-center">
        <div className="flex flex-col space-y-2 mb-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-text-primary flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-primary" /> Durasi Ekstrem
            </span>
            <span className="text-[10px] font-mono font-bold text-primary dark:text-secondary bg-blue-50/50 dark:bg-blue-900/30 px-2 py-1 rounded-md border border-blue-200/50 dark:border-blue-800/50">
              {baseDurasi} dtk
            </span>
          </div>
          <div className="relative pt-1 pb-1">
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={baseDurasi}
              onChange={(e) => setBaseDurasi(Number(e.target.value))}
              onMouseUp={() => handleSliderRelease(baseDurasi)}
              onTouchEnd={() => handleSliderRelease(baseDurasi)}
              className="w-full accent-primary cursor-pointer h-1.5 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[8px] text-slate-400 mt-1.5 font-mono">
              <span>1s</span>
              <span>15s</span>
              <span>30s</span>
            </div>
          </div>
        </div>
        
        <p className="text-[9px] text-text-secondary leading-relaxed italic text-center px-2 mb-4">
          Atur durasi maksimal penyiraman saat cuaca terpanas & tanah terkering.
        </p>

        <div className="flex items-center justify-between gap-4 py-3 mt-auto border-t border-white/50 dark:border-white/10">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 shrink-0 bg-primary/10 border border-primary/20 rounded-xl">
              <Crosshair className="w-4 h-4 text-primary dark:text-secondary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-text-primary truncate">Kalibrasi Ulang Sensor</p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
                Sesuaikan akurasi sensor kelembapan tanah
              </p>
            </div>
          </div>
          <button
            onClick={() => setCalibrationModalOpen(true)}
            className="px-4 py-2 bg-indigo-50 dark:bg-primary/10 hover:bg-indigo-100 dark:hover:bg-primary/20 border border-indigo-200 dark:border-primary/30 text-primary dark:text-secondary rounded-xl text-xs font-bold transition-colors cursor-pointer active:scale-95"
          >
            Mulai
          </button>
        </div>
      </div>

      <div className="pt-2 border-t border-white/50 dark:border-white/10 shrink-0">
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all duration-300 bg-primary hover:bg-primary text-white shadow-sm shadow-primary/20 active:scale-95"
        >
          <Save className="w-3 h-3" />
          Simpan Kalibrasi
        </button>
      </div>
    </>
  );

  const renderContent = () => {
    if (variant === "minimal") {
      return (
        <div className="bg-transparent border-l-4 border-slate-500 pl-4 py-2 flex flex-col h-full pointer-events-auto relative">
          {calibrationContent}
        </div>
      );
    }

    if (variant === "glassmorphism") {
      return (
        <div className="bg-surface backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] h-full flex flex-col p-4 relative overflow-hidden pointer-events-auto">
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full bg-slate-500/20 blur-2xl"></div>
          <div className="flex-1 flex flex-col relative z-10">
            {calibrationContent}
          </div>
        </div>
      );
    }

    if (variant === "solid") {
      return (
        <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl shadow-xl h-full flex flex-col p-4 relative overflow-hidden pointer-events-auto">
          <div className="flex-1 flex flex-col relative z-10">
            {calibrationContent}
          </div>
        </div>
      );
    }

    if (variant === "neon") {
      return (
        <div className="bg-background border border-slate-500/50 rounded-xl flex flex-col p-4 h-full relative overflow-hidden shadow-[0_0_15px_rgba(100,116,139,0.3),inset_0_0_20px_rgba(100,116,139,0.1)] pointer-events-auto">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-slate-400 to-transparent opacity-70"></div>
          <div className="flex-1 flex flex-col relative z-10">
            {calibrationContent}
          </div>
        </div>
      );
    }

    if (variant === "neobrutalism") {
      return (
        <div className="border-4 border-black rounded-xl flex flex-col p-4 h-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-surface pointer-events-auto">
          <div className="flex-1 flex flex-col relative">
            {calibrationContent}
          </div>
        </div>
      );
    }

    if (variant === "neumorphism") {
      return (
        <div className="bg-[#e0e5ec] dark:bg-slate-800 rounded-3xl p-4 flex flex-col h-full shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(255,255,255,0.05)] border-none pointer-events-auto overflow-hidden">
          <div className="flex-1 flex flex-col relative">
            {calibrationContent}
          </div>
        </div>
      );
    }

    // Default UI
    return (
      <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl flex flex-col h-full overflow-hidden shadow-sm p-3 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300 pointer-events-auto">
        {calibrationContent}
      </div>
    );
  };
  return (
    <motion.div variants={itemVariants} className="h-full">
      {renderContent()}
      <CalibrationWizardModal
        isOpen={calibrationModalOpen}
        onClose={() => setCalibrationModalOpen(false)}
        telemetry={telemetry}
        publishCommand={publishCommand}
      />
    </motion.div>
  );
}
