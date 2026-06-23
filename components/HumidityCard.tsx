import React from "react";
import { Cloud, CloudRain, PowerOff } from "lucide-react";
import { motion } from "framer-motion";
import { SmartPlantData } from "../types";

interface HumidityCardProps {
  telemetry: SmartPlantData | null;
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
};

export default function HumidityCard({ telemetry }: HumidityCardProps) {
  const isAvailable = telemetry?.humidity !== undefined && telemetry?.humidity !== -1;
  const humidity = telemetry?.humidity || 0;

  return (
    <motion.div
      variants={itemVariants}
      className={`bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl flex flex-col h-full overflow-hidden shadow-sm p-3 transition-all duration-300 ${!isAvailable ? 'grayscale opacity-70' : 'hover:border-slate-300 dark:hover:border-slate-700/80'}`}
    >
      <div className="flex items-center justify-between border-b border-white/50 dark:border-white/10 pb-2 mb-2 shrink-0">
        <div className="flex items-center gap-2">
          {isAvailable ? (
            <div className="p-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Cloud className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            </div>
          ) : (
            <div className="p-1.5 bg-slate-500/10 rounded-lg border border-slate-500/20">
              <PowerOff className="w-4 h-4 text-slate-400" />
            </div>
          )}
          <h3 className="font-bold text-slate-800 dark:text-slate-200 tracking-wide text-xs">Kelembapan</h3>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="flex items-start">
          <span className={`text-4xl font-black tracking-tight ${isAvailable ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400'}`}>
            {isAvailable ? humidity.toFixed(1) : "--"}
          </span>
          <span className={`text-lg font-bold mt-1 ${isAvailable ? 'text-blue-400/70' : 'text-slate-400/70'}`}>
            %
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center text-[9px] font-semibold mt-2 pt-2 border-t border-white/50 dark:border-white/10 shrink-0">
        {isAvailable ? (
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <CloudRain className="w-3 h-3 text-blue-400" />
            Sensor Lingkungan Aktif
          </span>
        ) : (
          <span className="text-slate-500 flex items-center gap-1">
            <PowerOff className="w-3 h-3" />
            Modul Dinonaktifkan
          </span>
        )}
      </div>
    </motion.div>
  );
}
