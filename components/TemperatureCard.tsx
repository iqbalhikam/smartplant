import React from "react";
import { Thermometer, ThermometerSnowflake, PowerOff } from "lucide-react";
import { motion } from "framer-motion";
import { SmartPlantData, WidgetVariant } from "../types";

interface TemperatureCardProps {
  telemetry: SmartPlantData | null;
  variant?: WidgetVariant;
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
};

export default function TemperatureCard({ telemetry, variant = "default" }: TemperatureCardProps) {
  const isAvailable = telemetry?.suhu !== undefined && telemetry?.suhu !== -1;
  const suhu = telemetry?.suhu || 0;

  if (variant === "minimal") {
    return (
      <motion.div
        variants={itemVariants}
        className={`bg-transparent border-l-4 ${isAvailable ? 'border-primary' : 'border-slate-300'} pl-4 py-2 flex flex-col h-full justify-between transition-all ${!isAvailable ? 'opacity-60 grayscale' : ''}`}
      >
        <div className="flex items-center gap-2 mb-2">
          {isAvailable ? <Thermometer className="w-4 h-4 text-primary" /> : <PowerOff className="w-4 h-4 text-slate-400" />}
          <h3 className="font-semibold text-text-secondary text-xs uppercase tracking-wider">Suhu Udara</h3>
        </div>
        <div className="flex items-baseline gap-1 mt-auto">
          <span className={`text-5xl font-light tracking-tighter ${isAvailable ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'}`}>
            {isAvailable ? suhu.toFixed(1) : "--"}
          </span>
          <span className="text-xl font-medium text-slate-400">°C</span>
        </div>
      </motion.div>
    );
  }

  if (variant === "glassmorphism") {
    return (
      <motion.div
        variants={itemVariants}
        className={`bg-surface backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] flex flex-col h-full overflow-hidden p-6 transition-all ${!isAvailable ? 'opacity-60 grayscale' : 'hover:shadow-[0_8px_32px_0_rgba(249,115,22,0.15)]'}`}
      >
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          {isAvailable ? (
            <div className="w-14 h-14 rounded-full bg-linear-to-br from-secondary/30 to-rose-400/10 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(249,115,22,0.2)] border border-white/30">
              <Thermometer className="w-7 h-7 text-primary dark:text-secondary drop-shadow-sm" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-slate-500/10 flex items-center justify-center mb-4 border border-white/20">
              <PowerOff className="w-7 h-7 text-slate-400" />
            </div>
          )}
          <span className={`text-5xl font-black tracking-tight drop-shadow-sm ${isAvailable ? 'bg-clip-text text-transparent bg-linear-to-br from-secondary to-primary dark:from-secondary dark:to-rose-400' : 'text-slate-400'}`}>
            {isAvailable ? `${suhu.toFixed(1)}°` : "--"}
          </span>
          <h3 className="font-medium text-slate-600 dark:text-slate-300 text-sm mt-3 tracking-wide">TEMPERATURE</h3>
        </div>
      </motion.div>
    );
  }

  if (variant === "solid") {
    return (
      <motion.div
        variants={itemVariants}
        className={`bg-linear-to-br ${isAvailable ? 'from-primary to-red-600 shadow-primary/30 hover:shadow-primary/50' : 'from-slate-400 to-slate-600 shadow-slate-500/20'} text-white shadow-xl rounded-2xl flex flex-col h-full overflow-hidden p-4 transition-all duration-300 relative`}
      >
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-3 shrink-0 relative z-10">
          <div className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-white" />
            <h3 className="font-bold tracking-wide text-sm text-white drop-shadow-sm">Suhu Udara</h3>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center relative z-10">
          <div className="flex items-start drop-shadow-md">
            <span className="text-5xl font-black tracking-tight text-white">
              {isAvailable ? suhu.toFixed(1) : "--"}
            </span>
            <span className="text-xl font-bold mt-1 text-white/80">°C</span>
          </div>
        </div>
        <div className="flex items-center justify-center text-[10px] font-medium mt-3 pt-3 border-t border-white/20 shrink-0 relative z-10">
          {isAvailable ? (
            <span className="text-white/90 flex items-center gap-1">
              <ThermometerSnowflake className="w-3.5 h-3.5 text-white" /> Sistem Stabil
            </span>
          ) : (
            <span className="text-white/70 flex items-center gap-1">
              <PowerOff className="w-3 h-3" /> Offline
            </span>
          )}
        </div>
      </motion.div>
    );
  }

  if (variant === "neon") {
    return (
      <motion.div variants={itemVariants} className={`bg-background border border-primary/50 rounded-xl p-5 flex flex-col h-full relative overflow-hidden shadow-[0_0_15px_rgba(249,115,22,0.3),inset_0_0_20px_rgba(249,115,22,0.1)] ${!isAvailable ? 'opacity-60 grayscale' : ''}`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-secondary to-transparent opacity-70"></div>
        <div className="flex justify-between items-start mb-6">
           <div className="flex items-center gap-2">
             <Thermometer className="w-5 h-5 text-secondary drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
             <h3 className="font-mono text-secondary uppercase tracking-[0.2em] text-xs drop-shadow-[0_0_2px_rgba(249,115,22,0.5)]">SYS_TEMP</h3>
           </div>
        </div>
        <div className="flex-1 flex items-center justify-center relative">
           <div className="absolute inset-0 flex items-center justify-center blur-2xl opacity-20 bg-primary rounded-full"></div>
           <div className="relative flex items-end">
             <span className="text-6xl font-mono text-secondary drop-shadow-[0_0_10px_rgba(253,186,116,0.8)] leading-none">
               {isAvailable ? suhu.toFixed(1) : "ERR"}
             </span>
             <span className="text-xl font-mono text-primary ml-1 mb-1">C</span>
           </div>
        </div>
      </motion.div>
    );
  }

  if (variant === "neobrutalism") {
    return (
      <motion.div variants={itemVariants} className={`border-4 border-black rounded-xl p-5 flex flex-col h-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-[#ff90e8] ${!isAvailable ? 'opacity-60 grayscale' : ''}`}>
        <div className="flex justify-between items-start mb-6 border-b-4 border-black pb-4">
           <div className="flex items-center gap-2">
             <div className="bg-white border-2 border-black p-1 rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
               <Thermometer className="w-5 h-5 text-black" fill="black" />
             </div>
             <h3 className="font-black text-black uppercase tracking-widest text-sm">SUHU UDARA</h3>
           </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-4 bg-white border-4 border-black shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.1)] rounded-lg mb-4">
           <div className="flex items-baseline">
             <span className="text-7xl font-black text-black tracking-tighter leading-none">
               {isAvailable ? suhu.toFixed(1) : "--"}
             </span>
             <span className="text-3xl font-black text-black ml-1">C</span>
           </div>
        </div>
      </motion.div>
    );
  }

  if (variant === "neumorphism") {
    return (
      <motion.div variants={itemVariants} className={`bg-[#e0e5ec] dark:bg-slate-800 rounded-3xl p-6 flex flex-col h-full shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(255,255,255,0.05)] border-none ${!isAvailable ? 'opacity-60 grayscale' : ''}`}>
        <div className="flex justify-between items-center mb-6">
           <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#e0e5ec] dark:bg-slate-800 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] text-primary">
             <Thermometer className="w-4 h-4" />
           </div>
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Suhu</span>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center">
           <div className="w-28 h-28 rounded-full flex items-center justify-center bg-[#e0e5ec] dark:bg-slate-800 shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,0.5)] dark:shadow-[6px_6px_12px_rgba(0,0,0,0.4),-6px_-6px_12px_rgba(255,255,255,0.05)] mb-4 border-4 border-[#e0e5ec] dark:border-slate-800">
             <span className="text-3xl font-black text-slate-700 dark:text-slate-200">{isAvailable ? `${suhu.toFixed(1)}°` : '--'}</span>
           </div>
        </div>
      </motion.div>
    );
  }

  // Default UI
  return (
    <motion.div
      variants={itemVariants}
      className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col h-full overflow-hidden shadow-sm p-3 transition-all duration-300 ${!isAvailable ? 'grayscale opacity-70' : 'hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md'}`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 pb-2 mb-2 shrink-0">
        <div className="flex items-center gap-2">
          {isAvailable ? (
            <div className="p-1.5 bg-orange-50 dark:bg-primary/10 rounded-lg border border-orange-100 dark:border-primary/20">
              <Thermometer className="w-4 h-4 text-primary dark:text-secondary" />
            </div>
          ) : (
            <div className="p-1.5 bg-slate-50 dark:bg-slate-500/10 rounded-lg border border-slate-100 dark:border-slate-500/20">
              <PowerOff className="w-4 h-4 text-slate-400" />
            </div>
          )}
          <h3 className="font-bold text-text-primary tracking-wide text-xs">Suhu Udara</h3>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="flex items-start">
          <span className={`text-4xl font-bold tracking-tight ${isAvailable ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>
            {isAvailable ? suhu.toFixed(1) : "--"}
          </span>
          <span className={`text-lg font-semibold mt-1 ${isAvailable ? 'text-primary dark:text-secondary' : 'text-slate-400'}`}>
            °C
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center text-[10px] text-text-secondary mt-2 pt-2 border-t border-slate-50 dark:border-slate-700/50 shrink-0">
        {isAvailable ? "Sensor Aktif" : "Nonaktif"}
      </div>
    </motion.div>
  );
}
