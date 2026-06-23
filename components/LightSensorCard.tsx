import React from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { SmartPlantData } from "../types";

interface LightSensorCardProps {
  telemetry: SmartPlantData;
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
};

const getCahayaStatus = (cahaya: number) => {
  if (cahaya === 0) return { label: "TERIK", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" };
  return { label: "GELAP", className: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" };
};

export default function LightSensorCard({ telemetry }: LightSensorCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      className="flex flex-col h-full min-h-0 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden p-3 group"
    >
      <div className="flex items-center justify-between border-b border-white/50 dark:border-white/10 pb-2 mb-2 shrink-0">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Sensor Cahaya</span>
        <span className="text-[9px] font-mono text-slate-500">RAW: {telemetry.cahaya}</span>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center gap-3">
        {telemetry.cahaya === 0 ? (
          /* Sunny / Bright Status */
          <>
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl shadow-inner animate-pulse">
              <Sun className="w-8 h-8 text-amber-500 dark:text-amber-400 stroke-2 animate-[spin_12s_linear_infinite]" />
            </div>
            <div className="text-center">
              <div className="text-lg font-black text-amber-600 dark:text-amber-400 tracking-wide uppercase">TERANG</div>
              <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">Lampu UV otomatis mati.</div>
            </div>
          </>
        ) : (
          /* Moon / Dark Status */
          <>
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl shadow-inner animate-pulse">
              <Moon className="w-8 h-8 text-indigo-500 dark:text-indigo-400 stroke-2" />
            </div>
            <div className="text-center">
              <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">GELAP</div>
              <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">Lampu UV otomatis nyala.</div>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-white/50 dark:border-white/10 pt-2 mt-2 shrink-0">
        <div className="text-[8px] text-slate-500 font-mono flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
          Berdasarkan LDR
        </div>
        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${getCahayaStatus(telemetry.cahaya).className}`}>
          {getCahayaStatus(telemetry.cahaya).label}
        </span>
      </div>
    </motion.div>
  );
}
