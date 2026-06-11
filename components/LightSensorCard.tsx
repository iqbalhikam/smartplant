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

export default function LightSensorCard({ telemetry }: LightSensorCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl flex flex-col justify-between h-[180px] hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300 relative overflow-hidden group"
    >
      {/* Decorative background glow for Light status */}
      {telemetry.cahaya === 1 ? (
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
      ) : (
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Sensor Cahaya</span>
        <span className="text-[10px] font-mono text-slate-500">RAW: {telemetry.cahaya}</span>
      </div>

      <div className="flex items-center gap-5 my-2">
        {telemetry.cahaya === 1 ? (
          /* Sunny / Bright Status */
          <>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl shadow-lg shadow-amber-500/5 animate-pulse">
              <Sun className="w-10 h-10 text-amber-400 stroke-2 animate-[spin_12s_linear_infinite]" />
            </div>
            <div>
              <div className="text-2xl font-black text-amber-500 dark:text-amber-300 tracking-wide uppercase">TERANG</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Lampu UV otomatis mati.</div>
            </div>
          </>
        ) : (
          /* Moon / Dark Status */
          <>
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl shadow-lg shadow-indigo-500/5 animate-pulse">
              <Moon className="w-10 h-10 text-indigo-400 stroke-2" />
            </div>
            <div>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-300 tracking-wide uppercase">GELAP</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Lampu UV siap diaktifkan.</div>
            </div>
          </>
        )}
      </div>

      <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 border-t border-slate-200 dark:border-slate-800/80 pt-2.5">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
        Berdasarkan nilai sensor cahaya LDR
      </div>
    </motion.div>
  );
}
