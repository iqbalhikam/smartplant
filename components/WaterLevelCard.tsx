import React from "react";
import { Droplets, PowerOff } from "lucide-react";
import { motion } from "framer-motion";
import { SmartPlantData } from "../types";

interface WaterLevelCardProps {
  telemetry: SmartPlantData | null;
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
};

export default function WaterLevelCard({ telemetry }: WaterLevelCardProps) {
  const isAvailable = telemetry?.air !== undefined && telemetry?.air !== -1;
  const air = telemetry?.air || 0;
  
  if (!isAvailable) {
    return null;
  }

  // Asumsi level air adalah persentase (0-100%)
  const percentage = Math.min(100, Math.max(0, air));

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700/80 mb-6"
    >
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-sky-500/10 rounded-lg border border-sky-500/20">
            <Droplets className="w-4 h-4 text-sky-500 dark:text-sky-400" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 tracking-wide text-sm">Level Tangki Air</h3>
        </div>
      </div>

      <div className="flex items-end gap-2 mb-2">
        <div className="flex items-start">
          <span className="text-4xl md:text-5xl font-black tracking-tight text-sky-500 dark:text-sky-400">
            {percentage}
          </span>
          <span className="text-xl font-bold mt-1 text-sky-400/70">
            %
          </span>
        </div>
      </div>

      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-4 mb-3">
        <div 
          className="h-full transition-all duration-1000 bg-sky-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-slate-500 dark:text-slate-400">
          {percentage < 20 ? "Perlu Diisi Ulang" : "Kapasitas Cukup"}
        </span>
      </div>
    </motion.div>
  );
}
