import React from "react";
import { Droplet, Thermometer, Cloud, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { SmartPlantData } from "../types";

interface SoilMoistureCardProps {
  telemetry: SmartPlantData;
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
};

export default function SoilMoistureCard({ telemetry }: SoilMoistureCardProps) {
  // Safe parsing of telemetry data
  const isSuhuAvailable = telemetry.suhu !== undefined && telemetry.suhu !== -1;
  const isHumAvailable = telemetry.humidity !== undefined && telemetry.humidity !== -1;
  
  const suhu = telemetry.suhu || 0;
  const humidity = telemetry.humidity || 0;
  
  // Soil Moisture calculation
  const rawTanah = telemetry.tanah;
  const calBasah = telemetry.calBasah || 0;
  const calKering = telemetry.calKering || 4095;
  
  let percentage = 0;
  if (calKering !== calBasah) {
    percentage = Math.round(((calKering - rawTanah) / (calKering - calBasah)) * 100);
    percentage = Math.max(0, Math.min(100, percentage));
  }
  
  // Status badges
  let soilStatus = "NORMAL";
  let soilColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  if (percentage < 20) {
    soilStatus = "SANGAT KERING";
    soilColor = "text-red-500 bg-red-500/10 border-red-500/20";
  } else if (percentage < 40) {
    soilStatus = "KERING";
    soilColor = "text-orange-500 bg-orange-500/10 border-orange-500/20";
  } else if (percentage > 80) {
    soilStatus = "SANGAT BASAH";
    soilColor = "text-blue-500 bg-blue-500/10 border-blue-500/20";
  }
  
  let tempStatus = "NORMAL";
  let tempColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  if (suhu > 30) {
    tempStatus = "PANAS";
    tempColor = "text-orange-500 bg-orange-500/10 border-orange-500/20";
  } else if (suhu < 20) {
    tempStatus = "DINGIN";
    tempColor = "text-cyan-500 bg-cyan-500/10 border-cyan-500/20";
  }
  
  let humStatus = "NORMAL";
  let humColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  if (humidity > 70) {
    humStatus = "LEMBAP";
    humColor = "text-blue-500 bg-blue-500/10 border-blue-500/20";
  } else if (humidity < 40) {
    humStatus = "KERING";
    humColor = "text-orange-500 bg-orange-500/10 border-orange-500/20";
  }

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl flex flex-col h-full shadow-sm p-4 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300 md:col-span-2"
    >
      <div className="flex items-start justify-between border-b border-white/50 dark:border-white/10 pb-3 mb-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-emerald-500/10 rounded border border-emerald-500/20">
              <Activity className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 tracking-wide text-[11px] uppercase">KONDISI EKOSISTEM</h3>
          </div>
          <span className="text-[9px] text-slate-500 mt-0.5 ml-7">Iklim Mikro & Tanah</span>
        </div>
        <button className="px-2 py-1 rounded text-[9px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
          MEMANTAU
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
        {/* Tanah */}
        <div className="bg-gradient-to-br from-white/40 to-white/10 dark:from-slate-800/60 dark:to-slate-900/40 rounded-xl p-4 border border-white/40 dark:border-slate-700/50 flex flex-col sm:col-span-2 relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
          <div className="flex justify-between items-center relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded-lg border ${soilColor}`}>
                  <Droplet className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold tracking-widest text-slate-700 dark:text-slate-300 uppercase">KELEMBAPAN TANAH</span>
              </div>
              <div className="flex items-end gap-1.5 mb-2">
                <span className="text-6xl font-black text-slate-800 dark:text-white leading-none tracking-tighter">{percentage}</span>
                <span className="text-xl font-bold text-slate-500 dark:text-slate-400 mb-1.5">%</span>
              </div>
              <div className="mt-2">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black border uppercase tracking-widest shadow-sm ${soilColor}`}>
                  {soilStatus}
                </span>
              </div>
            </div>
            
            {/* Animated circular progress indicator */}
            <div className="w-28 h-28 relative mr-2">
              <svg className="w-full h-full transform -rotate-90 drop-shadow-lg" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-700/40"
                  strokeWidth="8"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  className={percentage < 20 ? "text-red-500" : percentage < 40 ? "text-orange-500" : percentage > 80 ? "text-blue-500" : "text-emerald-500"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 251.2" }}
                  animate={{ strokeDasharray: `${(percentage / 100) * 251.2} 251.2` }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.1 }}
                />
              </svg>
              {/* Inner glow effect */}
              <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 ${percentage < 20 ? "bg-red-500" : percentage < 40 ? "bg-orange-500" : percentage > 80 ? "bg-blue-500" : "bg-emerald-500"}`}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <Droplet className={`w-8 h-8 ${percentage < 20 ? "text-red-500" : percentage < 40 ? "text-orange-500" : percentage > 80 ? "text-blue-500" : "text-emerald-500"}`} />
              </div>
            </div>
          </div>
          
          {/* Decorative background element */}
          <div className={`absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-3xl opacity-10 ${percentage < 20 ? "bg-red-500" : percentage < 40 ? "bg-orange-500" : percentage > 80 ? "bg-blue-500" : "bg-emerald-500"}`}></div>
        </div>

        {/* Suhu */}
        <div className="bg-white/30 dark:bg-slate-900/40 rounded-xl p-3 border border-white/40 dark:border-slate-800/50 flex flex-col">
          <div className="flex items-center gap-1.5 mb-2">
            <Thermometer className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">SUHU UDARA</span>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">{isSuhuAvailable ? suhu.toFixed(1) : "--"}</span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-0.5">°C</span>
          </div>
          <div className="mt-2">
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black border ${isSuhuAvailable ? tempColor : 'text-slate-500 bg-slate-500/10 border-slate-500/20'}`}>
              {isSuhuAvailable ? tempStatus : 'N/A'}
            </span>
          </div>
        </div>

        {/* Kelembapan */}
        <div className="bg-white/30 dark:bg-slate-900/40 rounded-xl p-3 border border-white/40 dark:border-slate-800/50 flex flex-col">
          <div className="flex items-center gap-1.5 mb-2">
            <Cloud className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">UDARA SEKITAR</span>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">{isHumAvailable ? humidity.toFixed(1) : "--"}</span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-0.5">%</span>
          </div>
          <div className="mt-2">
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black border ${isHumAvailable ? humColor : 'text-slate-500 bg-slate-500/10 border-slate-500/20'}`}>
              {isHumAvailable ? humStatus : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 text-center">
        <p className="text-[9px] text-slate-500 dark:text-slate-400 italic">"Kondisi seimbang. AI memantau data sensor..."</p>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/50 dark:border-white/10 text-[9px]">
        <div className="text-slate-500 font-medium flex gap-1">
          <span>SENSOR TANAH:</span> <span className="font-bold text-slate-700 dark:text-slate-300">{rawTanah}</span> / {telemetry.batasKering || calKering}
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-emerald-500"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>+{calBasah}</span>
          <span className="flex items-center gap-1 text-red-500"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>+{calKering}</span>
        </div>
      </div>
    </motion.div>
  );
}
