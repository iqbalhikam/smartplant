import React, { useState, useEffect } from "react";
import { Clock, Save, Settings2 } from "lucide-react";
import { motion } from "framer-motion";
import { SmartPlantData } from "../types";
import { toast } from "sonner";
import { Crosshair } from "lucide-react";
import CalibrationWizardModal from "./CalibrationWizardModal";

interface PumpCalibrationCardProps {
  telemetry: SmartPlantData;
  publishCommand: (command: string) => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
};

export default function PumpCalibrationCard({ telemetry, publishCommand }: PumpCalibrationCardProps) {
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

  return (
    <>
    <motion.div
      variants={itemVariants}
      className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl flex flex-col h-full overflow-hidden shadow-sm p-3 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300"
    >
      <div className="flex items-center justify-between border-b border-white/50 dark:border-white/10 pb-2 mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-sky-500/10 rounded-lg border border-sky-500/20">
            <Settings2 className="w-4 h-4 text-sky-500 dark:text-sky-400" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 tracking-wide text-xs">Pusat Kalibrasi Perangkat</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col justify-center">
        <div className="flex flex-col space-y-2 mb-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-blue-500" /> Durasi Ekstrem
            </span>
            <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/30 px-2 py-1 rounded-md border border-blue-200/50 dark:border-blue-800/50">
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
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[8px] text-slate-400 mt-1.5 font-mono">
              <span>1s</span>
              <span>15s</span>
              <span>30s</span>
            </div>
          </div>
        </div>
        
        <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed italic text-center px-2 mb-4">
          Atur durasi maksimal penyiraman saat cuaca terpanas & tanah terkering.
        </p>

        <div className="flex items-center justify-between gap-4 py-3 mt-auto border-t border-white/50 dark:border-white/10">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 shrink-0 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <Crosshair className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">Kalibrasi Ulang Sensor</p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
                Sesuaikan akurasi sensor kelembapan tanah
              </p>
            </div>
          </div>
          <button
            onClick={() => setCalibrationModalOpen(true)}
            className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold transition-colors cursor-pointer active:scale-95"
          >
            Mulai
          </button>
        </div>
      </div>

      <div className="pt-2 border-t border-white/50 dark:border-white/10 shrink-0">
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all duration-300 bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/20 active:scale-95"
        >
          <Save className="w-3 h-3" />
          Simpan Kalibrasi
        </button>
      </div>
    </motion.div>
      <CalibrationWizardModal
        isOpen={calibrationModalOpen}
        onClose={() => setCalibrationModalOpen(false)}
        telemetry={telemetry}
        publishCommand={publishCommand}
      />
    </>
  );
}
