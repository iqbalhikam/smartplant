import React from "react";
import { Thermometer, ThermometerSnowflake, PowerOff } from "lucide-react";
import { motion } from "framer-motion";
import { SmartPlantData } from "../types";

interface TemperatureCardProps {
  telemetry: SmartPlantData | null;
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
};

export default function TemperatureCard({ telemetry }: TemperatureCardProps) {
  const isAvailable = telemetry?.suhu !== undefined && telemetry?.suhu !== -1;
  const suhu = telemetry?.suhu || 0;

  return (
    <motion.div
      variants={itemVariants}
      className={`bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl transition-all duration-300 ${!isAvailable ? 'grayscale opacity-70' : 'hover:border-slate-300 dark:hover:border-slate-700/80'}`}
    >
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          {isAvailable ? (
            <div className="p-1.5 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <Thermometer className="w-4 h-4 text-orange-500 dark:text-orange-400" />
            </div>
          ) : (
            <div className="p-1.5 bg-slate-500/10 rounded-lg border border-slate-500/20">
              <PowerOff className="w-4 h-4 text-slate-400" />
            </div>
          )}
          <h3 className="font-bold text-slate-800 dark:text-slate-200 tracking-wide text-sm">Suhu Udara</h3>
        </div>
      </div>

      <div className="flex items-end gap-2 mb-2">
        <div className="flex items-start">
          <span className={`text-4xl md:text-5xl font-black tracking-tight ${isAvailable ? 'text-orange-500 dark:text-orange-400' : 'text-slate-400'}`}>
            {isAvailable ? suhu.toFixed(1) : "--"}
          </span>
          <span className={`text-xl font-bold mt-1 ${isAvailable ? 'text-orange-400/70' : 'text-slate-400/70'}`}>
            °C
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-semibold mt-4">
        {isAvailable ? (
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ThermometerSnowflake className="w-3.5 h-3.5 text-orange-400" />
            Sensor Suhu Lingkungan Aktif
          </span>
        ) : (
          <span className="text-slate-500 flex items-center gap-1.5">
            <PowerOff className="w-3.5 h-3.5" />
            Modul Dinonaktifkan
          </span>
        )}
      </div>
    </motion.div>
  );
}
