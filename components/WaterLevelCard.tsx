import React from "react";
import { Droplets, PowerOff } from "lucide-react";
import { motion } from "framer-motion";
import { SmartPlantData, WidgetVariant } from "../types";

interface WaterLevelCardProps {
  telemetry: SmartPlantData | null;
  variant?: WidgetVariant;
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
};

export default function WaterLevelCard({ telemetry, variant = "default" }: WaterLevelCardProps) {
  const isAvailable = telemetry?.air !== undefined && telemetry?.air !== -1;
  const air = telemetry?.air || 0;
  
  if (!isAvailable) {
    return null;
  }

  // Asumsi level air adalah persentase (0-100%)
  const percentage = Math.min(100, Math.max(0, air));

  if (variant === "minimal") {
    return (
      <motion.div
        variants={itemVariants}
        className="bg-transparent border-l-4 border-primary pl-4 py-2 flex flex-col h-full justify-between transition-all"
      >
        <div className="flex items-center gap-2 mb-2">
          <Droplets className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-text-secondary text-xs uppercase tracking-wider">Level Air</h3>
        </div>
        <div className="flex flex-col mt-auto">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-light tracking-tighter text-slate-800 dark:text-slate-100">
              {percentage}
            </span>
            <span className="text-lg font-medium text-slate-400">%</span>
          </div>
          <span className="text-xs font-medium text-slate-400">{percentage < 20 ? "Perlu Isi Ulang" : "Kapasitas Cukup"}</span>
        </div>
      </motion.div>
    );
  }

  if (variant === "glassmorphism") {
    return (
      <motion.div
        variants={itemVariants}
        className="bg-surface backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(var(--theme-primary-rgb), 0.07)] flex flex-col h-full overflow-hidden p-6 transition-all hover:shadow-lg relative"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 border border-white/30 bg-linear-to-br from-secondary/30 to-secondary/10 shadow-[0_0_20px_rgba(var(--theme-primary-rgb), 0.2)]">
            <Droplets className="w-7 h-7 text-primary dark:text-secondary drop-shadow-sm" />
          </div>
          <span className="text-5xl font-black tracking-tight drop-shadow-sm bg-clip-text text-transparent bg-linear-to-br from-secondary to-primary dark:from-secondary dark:to-secondary">
            {percentage}%
          </span>
          <h3 className="font-medium text-slate-600 dark:text-slate-300 text-sm mt-3 tracking-wide">TANGKI AIR</h3>
        </div>
      </motion.div>
    );
  }

  if (variant === "solid") {
    return (
      <motion.div
        variants={itemVariants}
        className="bg-linear-to-br from-secondary to-primary text-white shadow-primary/30 shadow-xl rounded-2xl flex flex-col h-full overflow-hidden p-4 transition-all duration-300 relative"
      >
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-3 shrink-0 relative z-10">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-white" />
            <h3 className="font-bold tracking-wide text-sm text-white drop-shadow-sm">Level Air</h3>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center relative z-10">
          <div className="flex items-baseline drop-shadow-md">
            <span className="text-5xl font-black tracking-tight text-white">
              {percentage}
            </span>
            <span className="text-xl font-bold ml-1 text-white/80">%</span>
          </div>
        </div>
        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden mt-3 mb-2 relative z-10">
          <div className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{ width: `${percentage}%` }}></div>
        </div>
        <div className="flex items-center justify-center text-[10px] font-medium pt-2 border-t border-white/20 shrink-0 relative z-10 text-white/90">
          {percentage < 20 ? "Perlu Isi Ulang" : "Kapasitas Cukup"}
        </div>
      </motion.div>
    );
  }

  if (variant === "neon") {
    return (
      <motion.div variants={itemVariants} className="bg-background border border-primary/50 rounded-xl p-5 flex flex-col h-full relative overflow-hidden shadow-[0_0_15px_rgba(var(--theme-primary-rgb), 0.3),inset_0_0_20px_rgba(var(--theme-primary-rgb), 0.1)] mb-6">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-secondary to-transparent opacity-70"></div>
        <div className="flex justify-between items-start mb-6">
           <div className="flex items-center gap-2">
             <Droplets className="w-5 h-5 text-secondary drop-shadow-[0_0_8px_rgba(var(--theme-primary-rgb), 0.8)]" />
             <h3 className="font-mono text-secondary uppercase tracking-[0.2em] text-xs drop-shadow-[0_0_2px_rgba(var(--theme-primary-rgb), 0.5)]">SYS_WATER_LVL</h3>
           </div>
        </div>
        <div className="flex-1 flex items-center justify-center relative">
           <div className="absolute inset-0 flex items-center justify-center blur-2xl opacity-20 bg-primary rounded-full"></div>
           <div className="relative flex items-end">
             <span className="text-6xl font-mono text-secondary drop-shadow-[0_0_10px_rgba(var(--theme-primary-rgb), 0.8)] leading-none">
               {percentage}
             </span>
             <span className="text-xl font-mono text-primary ml-1 mb-1">%</span>
           </div>
        </div>
      </motion.div>
    );
  }

  if (variant === "neobrutalism") {
    return (
      <motion.div variants={itemVariants} className="border-4 border-black rounded-xl p-5 flex flex-col h-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-[#ffeb3b] mb-6">
        <div className="flex justify-between items-start mb-6 border-b-4 border-black pb-4">
           <div className="flex items-center gap-2">
             <div className="bg-white border-2 border-black p-1 rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
               <Droplets className="w-5 h-5 text-black" fill="black" />
             </div>
             <h3 className="font-black text-black uppercase tracking-widest text-sm">LEVEL AIR</h3>
           </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-4 bg-white border-4 border-black shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.1)] rounded-lg mb-4">
           <div className="flex items-baseline">
             <span className="text-7xl font-black text-black tracking-tighter leading-none">
               {percentage}
             </span>
             <span className="text-3xl font-black text-black ml-1">%</span>
           </div>
        </div>
      </motion.div>
    );
  }

  if (variant === "neumorphism") {
    return (
      <motion.div variants={itemVariants} className="bg-[#e0e5ec] dark:bg-slate-800 rounded-3xl p-6 flex flex-col h-full shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(255,255,255,0.05)] border-none mb-6">
        <div className="flex justify-between items-center mb-6">
           <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#e0e5ec] dark:bg-slate-800 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] text-primary">
             <Droplets className="w-4 h-4" />
           </div>
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Level Air</span>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center">
           <div className="w-28 h-28 rounded-full flex items-center justify-center bg-[#e0e5ec] dark:bg-slate-800 shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,0.5)] dark:shadow-[6px_6px_12px_rgba(0,0,0,0.4),-6px_-6px_12px_rgba(255,255,255,0.05)] mb-4 border-4 border-[#e0e5ec] dark:border-slate-800">
             <span className="text-3xl font-black text-slate-700 dark:text-slate-200">{percentage}%</span>
           </div>
        </div>
      </motion.div>
    );
  }

  // Default UI
  return (
    <motion.div
      variants={itemVariants}
      className="bg-surface border border-border backdrop-blur-xl rounded-2xl flex flex-col h-full p-4 shadow-sm transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700/80 mb-6"
    >
      <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg border border-primary/20">
            <Droplets className="w-4 h-4 text-primary dark:text-secondary" />
          </div>
          <h3 className="font-bold text-text-primary tracking-wide text-sm">Level Tangki Air</h3>
        </div>
      </div>

      <div className="flex items-end gap-2 mb-2">
        <div className="flex items-start">
          <span className="text-4xl md:text-5xl font-black tracking-tight text-primary dark:text-secondary">
            {percentage}
          </span>
          <span className="text-xl font-bold mt-1 text-secondary/70">
            %
          </span>
        </div>
      </div>

      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-auto mb-3">
        <div 
          className="h-full transition-all duration-1000 bg-primary"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-text-secondary">
          {percentage < 20 ? "Perlu Diisi Ulang" : "Kapasitas Cukup"}
        </span>
      </div>
    </motion.div>
  );
}
