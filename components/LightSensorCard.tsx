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
  const isTerang = telemetry.cahaya === 0;

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl flex flex-col h-full shadow-sm p-4 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300"
    >
      <div className="flex items-center justify-between border-b border-white/50 dark:border-white/10 pb-3 mb-4">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 tracking-wide text-xs">SENSOR CAHAYA</h3>
        <span className="text-[10px] text-slate-500 font-medium">RAW: {telemetry.cahaya}</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className={`p-4 rounded-2xl border ${isTerang ? 'bg-orange-500/10 border-orange-500/20' : 'bg-indigo-500/10 border-indigo-500/20'} mb-4`}>
          {isTerang ? (
            <Sun className="w-8 h-8 text-orange-500 dark:text-orange-400" />
          ) : (
            <Moon className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
          )}
        </div>
        <h2 className={`text-2xl font-black tracking-tight mb-1 ${isTerang ? 'text-orange-500 dark:text-orange-400' : 'text-indigo-500 dark:text-indigo-400'}`}>
          {isTerang ? "TERANG" : "GELAP"}
        </h2>
        <p className="text-[11px] text-slate-500 text-center">
          {isTerang ? "Lampu UV otomatis mati." : "Lampu UV menyala."}
        </p>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/50 dark:border-white/10">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <span className={`w-2 h-2 rounded-full ${isTerang ? 'bg-orange-400' : 'bg-indigo-400'}`}></span>
          Berdasarkan LDR
        </div>
        <div className={`px-2 py-0.5 rounded text-[9px] font-bold border ${isTerang ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/20' : 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'}`}>
          {isTerang ? "TERIK" : "REDUK"}
        </div>
      </div>
    </motion.div>
  );
}
