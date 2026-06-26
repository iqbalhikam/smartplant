import React from "react";
import { Droplet, AlertTriangle, CheckCircle, Waves } from "lucide-react";
import { SmartPlantData, BaseWidgetProps } from "../types";
import { motion } from "framer-motion";
import { useDeviceStore } from "../store/useDeviceStore";

interface PlantWaterDemandBarProps extends BaseWidgetProps {
  telemetry: SmartPlantData;
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
};

export default function PlantWaterDemandBar({ telemetry, variant = "default" }: PlantWaterDemandBarProps) {
  // Safe parsing of telemetry data
  const rawTanah = telemetry?.tanah ?? 0;
  const batasKering = telemetry?.batasKering ?? 1725;
  const batasBasah = telemetry?.batasBasah ?? 1200;
  const calKering = telemetry?.calKering ?? 4095;
  const calBasah = telemetry?.calBasah ?? 0;
  
  const { plantPresets } = useDeviceStore();

  // Find matching preset based on current thresholds
  let activePreset = null;
  const range = calKering - calBasah;
  
  if (range > 0 && plantPresets.length > 0) {
    activePreset = plantPresets.find(p => {
      const expectedKering = Math.round(calKering - ((p.keringPct / 100) * range));
      const expectedBasah = Math.round(calKering - ((p.basahPct / 100) * range));
      // Allow minor differences due to rounding
      return Math.abs(expectedKering - batasKering) <= 2 && Math.abs(expectedBasah - batasBasah) <= 2;
    });
  }

  // Calculate relative percentage based on trigger thresholds
  let relativePercentage = 0;
  if (batasKering !== batasBasah) {
    relativePercentage = Math.round(((batasKering - rawTanah) / (batasKering - batasBasah)) * 100);
    relativePercentage = Math.max(0, Math.min(100, relativePercentage)); // Constrain between 0 and 100
  }

  // Determine dynamic colors and status based on the relative percentage
  let statusText = "Tidak Diketahui";
  let colorClass = "bg-slate-500";
  let textColorClass = "text-slate-500";
  let StatusIcon = Droplet;

  if (relativePercentage < 20) {
    statusText = "Kritis - Butuh Air";
    colorClass = "bg-red-500";
    textColorClass = "text-red-500";
    StatusIcon = AlertTriangle;
  } else if (relativePercentage > 80) {
    statusText = "Sangat Basah";
    colorClass = "bg-blue-500";
    textColorClass = "text-blue-500";
    StatusIcon = Waves;
  } else {
    statusText = "Ideal";
    colorClass = "bg-green-500";
    textColorClass = "text-green-500";
    StatusIcon = CheckCircle;
  }

  const renderContent = () => {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg border ${colorClass}/10 ${colorClass.replace('bg-', 'border-')}/20`}>
              <Droplet className={`w-4 h-4 ${textColorClass}`} />
            </div>
            <div className="flex flex-col">
              <h3 className="font-bold text-text-primary tracking-wide text-[11px] uppercase">Status Kebutuhan Air Tanaman</h3>
              {activePreset ? (
                <span className="text-[10px] text-primary flex items-center gap-1 font-semibold mt-0.5">
                  <span className="text-xs">{activePreset.icon}</span> {activePreset.label}
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 font-medium mt-0.5 italic">
                  Pengaturan Kustom
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-4">
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-2">
              <StatusIcon className={`w-6 h-6 ${textColorClass}`} />
              <div className="flex flex-col">
                <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Kondisi Relatif</span>
                <span className={`font-bold text-sm ${textColorClass}`}>{statusText}</span>
              </div>
            </div>
            <div className="flex items-baseline">
              <span className={`text-4xl font-black tracking-tighter ${textColorClass}`}>{relativePercentage}</span>
              <span className={`text-lg font-bold ml-0.5 ${textColorClass}`}>%</span>
            </div>
          </div>

          <div className="relative pt-1">
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-4 overflow-hidden border border-slate-300 dark:border-slate-700 shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${relativePercentage}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className={`h-full rounded-full ${colorClass} relative overflow-hidden`}
              >
                {/* Shimmer effect inside progress bar */}
                <div className="absolute top-0 left-0 w-full h-full bg-white/20" style={{ transform: 'skewX(-20deg)', width: '30px', animation: 'shimmer 2s infinite' }}></div>
              </motion.div>
            </div>
            
            <div className="flex justify-between text-[9px] font-bold text-slate-500 mt-2 uppercase tracking-widest font-mono">
              <span>Batas Kering ({batasKering})</span>
              <span>Batas Basah ({batasBasah})</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Wrap with the same styling as the other cards (using default UI as fallback but supporting variants if needed)
  if (variant === "glassmorphism") {
    return (
      <motion.div variants={itemVariants} className="bg-surface backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] h-full flex flex-col p-5 relative overflow-hidden">
        {renderContent()}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl flex flex-col h-full shadow-sm p-5 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300"
    >
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-20deg); }
          100% { transform: translateX(400%) skewX(-20deg); }
        }
      `}</style>
      {renderContent()}
    </motion.div>
  );
}
