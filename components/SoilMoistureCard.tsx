import React from "react";
import { Droplet, Thermometer, Cloud, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { SmartPlantData, BaseWidgetProps } from "../types";

interface SoilMoistureCardProps extends BaseWidgetProps {
  telemetry: SmartPlantData;
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
};

export default function SoilMoistureCard({ telemetry, variant = "default" }: SoilMoistureCardProps) {
  // Safe parsing of telemetry data
  const isSuhuAvailable = telemetry.suhu !== undefined && telemetry.suhu !== -1;
  const isHumAvailable = telemetry.humidity !== undefined && telemetry.humidity !== -1;
  
  const suhu = telemetry.suhu || 0;
  const humidity = telemetry.humidity || 0;
  
  // Soil Moisture calculation
  const rawTanah = telemetry.tanah ?? 0;
  const calBasah = telemetry.calBasah ?? 0;
  const calKering = telemetry.calKering ?? 4095;
  
  let percentage = 0;
  if (calKering !== calBasah) {
    percentage = Math.round(((calKering - rawTanah) / (calKering - calBasah)) * 100);
    percentage = Math.max(0, Math.min(100, percentage)); // Constrain 0-100
  }
  
  // Relative UI Indicator Logic based on Dynamic Thresholds
  const batasKering = telemetry.batasKering ?? calKering;
  const batasBasah = telemetry.batasBasah ?? calBasah;
  
  let soilStatus = "TIDAK DIKETAHUI";
  let soilColor = "text-slate-500 bg-slate-500/10 border-slate-500/20";
  let circleColor = "text-slate-500";

  if (telemetry.tanah !== undefined) {
    if (rawTanah >= batasKering) {
      soilStatus = "Kering - Butuh Air";
      soilColor = "text-red-500 bg-red-500/10 border-red-500/20";
      circleColor = "text-red-500";
    } else if (rawTanah <= batasBasah) {
      soilStatus = "Sangat Basah - Awas Busuk";
      soilColor = "text-blue-500 bg-blue-500/10 border-blue-500/20";
      circleColor = "text-blue-500";
    } else {
      soilStatus = "Kelembapan Ideal";
      soilColor = "text-green-500 bg-green-500/10 border-green-500/20";
      circleColor = "text-green-500";
    }
  }
  
  let tempStatus = "NORMAL";
  let tempColor = "text-primary bg-primary/10 border-primary/20";
  if (suhu > 30) {
    tempStatus = "PANAS";
    tempColor = "text-primary bg-primary/10 border-primary/20";
  } else if (suhu < 20) {
    tempStatus = "DINGIN";
    tempColor = "text-primary bg-primary/10 border-primary/20";
  }
  
  let humStatus = "NORMAL";
  let humColor = "text-primary bg-primary/10 border-primary/20";
  if (humidity > 70) {
    humStatus = "LEMBAP";
    humColor = "text-primary bg-primary/10 border-primary/20";
  } else if (humidity < 40) {
    humStatus = "KERING";
    humColor = "text-primary bg-primary/10 border-primary/20";
  }

  if (variant === "minimal") {
    return (
      <motion.div variants={itemVariants} className="bg-surface border-2 border-slate-100 dark:border-slate-800 rounded-xl p-5 flex flex-col md:col-span-2 shadow-sm h-full hover:border-primary/30 transition-all">
        <div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-2">
             <Droplet className={`w-5 h-5 ${circleColor}`} />
             <h3 className="font-bold text-text-primary uppercase tracking-widest text-xs">Ekosistem Tanah</h3>
           </div>
           <span className={`px-2 py-1 rounded text-[10px] font-bold ${soilColor}`}>{soilStatus}</span>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center">
           <div className="flex items-baseline gap-2">
             <span className="text-7xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">{percentage}</span>
             <span className="text-2xl font-bold text-slate-400">%</span>
           </div>
           <span className="text-xs font-medium text-slate-500 mt-2">Sensor Value: {rawTanah}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
           <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Suhu Udara</span>
              <span className="font-bold text-text-primary text-lg">{isSuhuAvailable ? `${suhu.toFixed(1)}°C` : '--'}</span>
           </div>
           <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Kelembapan</span>
              <span className="font-bold text-text-primary text-lg">{isHumAvailable ? `${humidity.toFixed(1)}%` : '--'}</span>
           </div>
        </div>
      </motion.div>
    );
  }

  if (variant === "glassmorphism") {
    return (
      <motion.div variants={itemVariants} className="bg-linear-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-3xl p-5 flex flex-col md:col-span-2 shadow-[0_8px_32px_0_rgba(16,185,129,0.1)] h-full overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 z-0"></div>
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex justify-between items-start mb-4">
             <div>
               <h3 className="font-bold text-slate-800 dark:text-white text-sm">Soil Moisture</h3>
               <p className="text-xs text-slate-600 dark:text-slate-300">{soilStatus}</p>
             </div>
             <div className="p-2 bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-xl">
               <Droplet className={`w-5 h-5 ${circleColor}`} />
             </div>
          </div>
          <div className="flex-1 flex items-center justify-center py-4">
             <div className="relative">
               <span className="text-8xl font-black bg-clip-text text-transparent bg-linear-to-b from-primary to-secondary dark:from-secondary dark:to-teal-200 tracking-tighter drop-shadow-sm">{percentage}</span>
               <span className="absolute bottom-4 -right-6 text-2xl font-bold text-primary/70 dark:text-secondary/70">%</span>
             </div>
          </div>
          <div className="flex items-center justify-between mt-auto bg-white/30 dark:bg-black/20 backdrop-blur-md rounded-2xl p-3">
             <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-primary" />
                <span className="font-bold text-slate-700 dark:text-slate-200">{isSuhuAvailable ? `${suhu.toFixed(1)}°` : '--'}</span>
             </div>
             <div className="w-px h-6 bg-slate-300 dark:bg-slate-700"></div>
             <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-primary" />
                <span className="font-bold text-slate-700 dark:text-slate-200">{isHumAvailable ? `${humidity.toFixed(0)}%` : '--'}</span>
             </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === "solid") {
    return (
      <motion.div variants={itemVariants} className="bg-linear-to-br from-secondary to-primary text-white border-none rounded-2xl p-5 flex flex-col md:col-span-2 shadow-xl h-full overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 z-0"></div>
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex justify-between items-start mb-4">
             <div>
               <h3 className="font-bold text-white text-sm">Ekosistem Tanah</h3>
               <p className="text-xs text-emerald-100">{soilStatus}</p>
             </div>
             <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
               <Droplet className="w-5 h-5 text-white" />
             </div>
          </div>
          <div className="flex-1 flex items-center justify-center py-4">
             <div className="relative flex items-baseline">
               <span className="text-8xl font-black text-white tracking-tighter drop-shadow-md">{percentage}</span>
               <span className="text-3xl font-bold text-emerald-200 ml-1">%</span>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-auto">
             <div className="flex flex-col bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <Thermometer className="w-3.5 h-3.5 text-white" />
                  <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider">Suhu</span>
                </div>
                <span className="font-black text-white text-xl">{isSuhuAvailable ? `${suhu.toFixed(1)}°C` : '--'}</span>
             </div>
             <div className="flex flex-col bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <Cloud className="w-3.5 h-3.5 text-white" />
                  <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider">Lembap</span>
                </div>
                <span className="font-black text-white text-xl">{isHumAvailable ? `${humidity.toFixed(0)}%` : '--'}</span>
             </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20 text-[10px] text-emerald-100 font-medium">
             <span>Nilai Sensor: <span className="font-bold text-white">{rawTanah}</span></span>
             <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-white" /> Sistem Aktif</span>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === "neon") {
    return (
      <motion.div variants={itemVariants} className="bg-background border border-primary/50 rounded-xl p-5 flex flex-col md:col-span-2 h-full relative overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.3),inset_0_0_20px_rgba(16,185,129,0.1)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-secondary to-transparent opacity-70"></div>
        <div className="flex justify-between items-start mb-6">
           <div className="flex items-center gap-2">
             <Droplet className="w-5 h-5 text-secondary drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
             <h3 className="font-mono text-secondary uppercase tracking-[0.2em] text-xs drop-shadow-[0_0_2px_rgba(52,211,153,0.5)]">SYS_MOISTURE</h3>
           </div>
           <span className="font-mono text-[9px] text-secondary border border-primary/50 px-2 py-0.5 rounded-sm bg-emerald-950/50">
             {soilStatus}
           </span>
        </div>
        <div className="flex-1 flex items-center justify-center relative">
           <div className="absolute inset-0 flex items-center justify-center blur-2xl opacity-20 bg-primary rounded-full"></div>
           <div className="relative flex items-end">
             <span className="text-7xl font-mono text-secondary drop-shadow-[0_0_10px_rgba(110,231,183,0.8)] leading-none">{percentage}</span>
             <span className="text-xl font-mono text-primary ml-1 mb-1">%</span>
           </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6 border-t border-emerald-900/50 pt-4">
           <div className="flex flex-col">
              <span className="text-[9px] font-mono text-primary uppercase mb-1">TEMP_VAL</span>
              <span className="font-mono text-secondary drop-shadow-[0_0_5px_rgba(52,211,153,0.5)] text-sm">{isSuhuAvailable ? `${suhu.toFixed(1)}°C` : 'ERR'}</span>
           </div>
           <div className="flex flex-col items-end">
              <span className="text-[9px] font-mono text-primary uppercase mb-1">HUM_VAL</span>
              <span className="font-mono text-secondary drop-shadow-[0_0_5px_rgba(52,211,153,0.5)] text-sm">{isHumAvailable ? `${humidity.toFixed(1)}%` : 'ERR'}</span>
           </div>
        </div>
      </motion.div>
    );
  }

  if (variant === "neobrutalism") {
    return (
      <motion.div variants={itemVariants} className="bg-[#ffeb3b] border-4 border-black rounded-xl p-5 flex flex-col md:col-span-2 h-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-start mb-6 border-b-4 border-black pb-4">
           <div className="flex items-center gap-2">
             <div className="bg-white border-2 border-black p-1 rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
               <Droplet className="w-5 h-5 text-black" fill="black" />
             </div>
             <h3 className="font-black text-black uppercase tracking-widest text-sm">EKOSISTEM TANAH</h3>
           </div>
           <span className="font-bold text-[10px] text-black border-2 border-black px-2 py-1 bg-[#ff90e8] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
             {soilStatus}
           </span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-4 bg-white border-4 border-black shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.1)] rounded-lg mb-4">
           <div className="flex items-baseline">
             <span className="text-8xl font-black text-black tracking-tighter leading-none">{percentage}</span>
             <span className="text-3xl font-black text-black ml-1">%</span>
           </div>
           <span className="text-xs font-bold text-black bg-[#4ade80] border-2 border-black px-3 py-1 mt-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -rotate-2">
             Sensor Val: {rawTanah}
           </span>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-auto">
           <div className="bg-[#ff90e8] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-2 rounded-lg flex justify-between items-center">
              <span className="text-[10px] font-black text-black uppercase">Suhu</span>
              <span className="font-black text-black text-sm bg-white border-2 border-black px-1.5">{isSuhuAvailable ? `${suhu.toFixed(1)}C` : 'N/A'}</span>
           </div>
           <div className="bg-[#4ade80] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-2 rounded-lg flex justify-between items-center">
              <span className="text-[10px] font-black text-black uppercase">Lembap</span>
              <span className="font-black text-black text-sm bg-white border-2 border-black px-1.5">{isHumAvailable ? `${humidity.toFixed(0)}%` : 'N/A'}</span>
           </div>
        </div>
      </motion.div>
    );
  }

  if (variant === "neumorphism") {
    return (
      <motion.div variants={itemVariants} className="bg-[#e0e5ec] dark:bg-slate-800 rounded-3xl p-6 flex flex-col md:col-span-2 h-full shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(255,255,255,0.05)] border-none">
        <div className="flex justify-between items-center mb-6">
           <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#e0e5ec] dark:bg-slate-800 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] text-primary">
             <Droplet className="w-4 h-4" />
           </div>
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{soilStatus}</span>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center">
           <div className="w-32 h-32 rounded-full flex items-center justify-center bg-[#e0e5ec] dark:bg-slate-800 shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,0.5)] dark:shadow-[6px_6px_12px_rgba(0,0,0,0.4),-6px_-6px_12px_rgba(255,255,255,0.05)] mb-4 border-4 border-[#e0e5ec] dark:border-slate-800">
             <span className="text-4xl font-black text-slate-700 dark:text-slate-200">{percentage}%</span>
           </div>
        </div>
        <div className="flex justify-around items-center mt-4">
           <div className="flex flex-col items-center">
             <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Suhu</span>
             <span className="text-sm font-black text-text-primary">{isSuhuAvailable ? `${suhu.toFixed(1)}°` : '--'}</span>
           </div>
           <div className="w-px h-8 bg-slate-300 dark:bg-slate-700"></div>
           <div className="flex flex-col items-center">
             <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Kelembapan</span>
             <span className="text-sm font-black text-text-primary">{isHumAvailable ? `${humidity.toFixed(0)}%` : '--'}</span>
           </div>
        </div>
      </motion.div>
    );
  }

  // Default UI
  return (
    <motion.div
      variants={itemVariants} 
      className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl flex flex-col h-full shadow-sm p-4 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300 md:col-span-2"
    >
      <div className="flex items-start justify-between border-b border-white/50 dark:border-white/10 pb-3 mb-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-primary/10 rounded border border-primary/20">
              <Activity className="w-3.5 h-3.5 text-primary dark:text-secondary" />
            </div>
            <h3 className="font-bold text-text-primary tracking-wide text-[11px] uppercase">KONDISI EKOSISTEM</h3>
          </div>
          <span className="text-[9px] text-slate-500 mt-0.5 ml-7">Iklim Mikro & Tanah</span>
        </div>
        <button className="px-2 py-1 rounded text-[9px] font-bold bg-primary/10 text-primary dark:text-secondary border border-primary/20 hover:bg-primary/20 transition-colors">
          MEMANTAU
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
        {/* Tanah */}
        <div className="bg-linear-to-br from-white/40 to-white/10 dark:from-slate-800/60 dark:to-slate-900/40 rounded-xl p-4 border border-white/40 dark:border-slate-700/50 flex flex-col sm:col-span-2 relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
          <div className="flex justify-between items-center relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded-lg border ${soilColor}`}>
                  <Droplet className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold tracking-widest text-text-primary uppercase">KELEMBAPAN TANAH</span>
              </div>
              <div className="flex items-end gap-1.5 mb-1">
                <span className="text-6xl font-black text-slate-800 dark:text-white leading-none tracking-tighter">{percentage}</span>
                <span className="text-xl font-bold text-text-secondary mb-1.5">%</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mb-3">
                Nilai Sensor: <span className="font-bold text-slate-700 dark:text-slate-300">{rawTanah}</span>
              </div>
              <div className="mt-1">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black border uppercase tracking-widest shadow-sm ${soilColor}`}>
                  {soilStatus}
                </span>
              </div>
            </div>
            
            {/* Animated circular progress indicator */}
            <div className="w-28 h-28 relative mr-2">
              <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
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
                  className={circleColor}
                  style={{ filter: "drop-shadow(0px 0px 8px currentColor)" }}
                  strokeWidth="8"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 251.2" }}
                  animate={{ strokeDasharray: `${(percentage / 100) * 251.2} 251.2` }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.1 }}
                />
              </svg>
              {/* Inner glow effect */}
              <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 ${circleColor.replace('text-', 'bg-')}`}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <Droplet className={`w-8 h-8 ${circleColor}`} />
              </div>
            </div>
          </div>
          
          {/* Decorative background element */}
          <div className={`absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-3xl opacity-10 ${circleColor.replace('text-', 'bg-')}`}></div>
        </div>

        {/* Suhu */}
        <div className="bg-surface rounded-xl p-3 border border-white/40 dark:border-slate-800/50 flex flex-col">
          <div className="flex items-center gap-1.5 mb-2">
            <Thermometer className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold text-text-primary">SUHU UDARA</span>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">{isSuhuAvailable ? suhu.toFixed(1) : "--"}</span>
            <span className="text-xs font-bold text-text-secondary mb-0.5">°C</span>
          </div>
          <div className="mt-2">
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black border ${isSuhuAvailable ? tempColor : 'text-slate-500 bg-slate-500/10 border-slate-500/20'}`}>
              {isSuhuAvailable ? tempStatus : 'N/A'}
            </span>
          </div>
        </div>

        {/* Kelembapan */}
        <div className="bg-surface rounded-xl p-3 border border-white/40 dark:border-slate-800/50 flex flex-col">
          <div className="flex items-center gap-1.5 mb-2">
            <Cloud className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold text-text-primary">UDARA SEKITAR</span>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">{isHumAvailable ? humidity.toFixed(1) : "--"}</span>
            <span className="text-xs font-bold text-text-secondary mb-0.5">%</span>
          </div>
          <div className="mt-2">
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black border ${isHumAvailable ? humColor : 'text-slate-500 bg-slate-500/10 border-slate-500/20'}`}>
              {isHumAvailable ? humStatus : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 text-center">
        <p className="text-[9px] text-text-secondary italic">"Kondisi seimbang. AI memantau data sensor..."</p>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/50 dark:border-white/10 text-[9px]">
        <div className="text-slate-500 font-medium flex gap-1">
          <span>SENSOR TANAH:</span> <span className="font-bold text-text-primary">{rawTanah}</span> / {telemetry.batasKering || calKering}
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-primary"><div className="w-1.5 h-1.5 rounded-full bg-primary"></div>+{calBasah}</span>
          <span className="flex items-center gap-1 text-danger"><div className="w-1.5 h-1.5 rounded-full bg-danger"></div>+{calKering}</span>
        </div>
      </div>
    </motion.div>
  );
}
