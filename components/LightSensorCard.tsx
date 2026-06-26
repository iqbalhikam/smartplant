
import React from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { SmartPlantData, WidgetVariant } from "../types";

interface LightSensorCardProps {
  telemetry: SmartPlantData;
  variant?: WidgetVariant;
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
};

export default function LightSensorCard({ telemetry, variant = "default" }: LightSensorCardProps) {
  const isTerang = telemetry.cahaya === 0;

  if (variant === "minimal") {
    return (
      <motion.div
        variants={itemVariants}
        className={`bg-transparent border-l-4 ${isTerang ? 'border-primary' : 'border-primary'} pl-4 py-2 flex flex-col h-full justify-between transition-all`}
      >
        <div className="flex items-center gap-2 mb-2">
          {isTerang ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-primary" />}
          <h3 className="font-semibold text-text-secondary text-xs uppercase tracking-wider">Cahaya</h3>
        </div>
        <div className="flex flex-col mt-auto">
          <span className={`text-4xl font-light tracking-tighter ${isTerang ? 'text-slate-800 dark:text-slate-100' : 'text-slate-800 dark:text-slate-100'}`}>
            {isTerang ? "TERANG" : "GELAP"}
          </span>
          <span className="text-xs font-medium text-slate-400">{isTerang ? "Lampu UV Mati" : "Lampu UV Aktif"}</span>
        </div>
      </motion.div>
    );
  }

  if (variant === "glassmorphism") {
    return (
      <motion.div
        variants={itemVariants}
        className={`bg-surface backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] flex flex-col h-full overflow-hidden p-6 transition-all hover:shadow-lg`}
      >
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 border border-white/30 ${isTerang ? 'bg-gradient-to-br from-secondary/30 to-secondary/10 shadow-[0_0_20px_rgba(249,115,22,0.2)]' : 'bg-gradient-to-br from-secondary/30 to-secondary/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]'}`}>
            {isTerang ? <Sun className="w-7 h-7 text-primary dark:text-secondary drop-shadow-sm" /> : <Moon className="w-7 h-7 text-primary dark:text-secondary drop-shadow-sm" />}
          </div>
          <span className={`text-4xl font-black tracking-tight drop-shadow-sm bg-clip-text text-transparent ${isTerang ? 'bg-gradient-to-br from-secondary to-primary dark:from-secondary dark:to-secondary' : 'bg-gradient-to-br from-secondary to-primary dark:from-secondary dark:to-secondary'}`}>
            {isTerang ? "TERANG" : "GELAP"}
          </span>
          <h3 className="font-medium text-slate-600 dark:text-slate-300 text-sm mt-3 tracking-wide">LIGHT SENSOR</h3>
        </div>
      </motion.div>
    );
  }

  if (variant === "solid") {
    return (
      <motion.div
        variants={itemVariants}
        className={`bg-gradient-to-br text-white shadow-xl rounded-2xl flex flex-col h-full overflow-hidden p-4 transition-all duration-300 relative ${isTerang ? 'from-primary to-primary shadow-primary/30' : 'from-primary to-purple-700 shadow-primary/30'}`}
      >
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-3 shrink-0 relative z-10">
          <div className="flex items-center gap-2">
            {isTerang ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-white" />}
            <h3 className="font-bold tracking-wide text-sm text-white drop-shadow-sm">Cahaya</h3>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center relative z-10">
          <div className="flex items-start drop-shadow-md">
            <span className="text-4xl font-black tracking-tight text-white">
              {isTerang ? "TERANG" : "GELAP"}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center text-[10px] font-medium mt-3 pt-3 border-t border-white/20 shrink-0 relative z-10 text-white/90">
          {isTerang ? "Cahaya Cukup" : "Butuh Pencahayaan UV"}
        </div>
      </motion.div>
    );
  }

  if (variant === "neon") {
    return (
      <motion.div variants={itemVariants} className="bg-background border border-primary/50 rounded-xl p-5 flex flex-col h-full relative overflow-hidden shadow-[0_0_15px_rgba(249,115,22,0.3),inset_0_0_20px_rgba(249,115,22,0.1)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-70"></div>
        <div className="flex justify-between items-start mb-6">
           <div className="flex items-center gap-2">
             {isTerang ? <Sun className="w-5 h-5 text-secondary drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" /> : <Moon className="w-5 h-5 text-secondary drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" />}
             <h3 className={`font-mono uppercase tracking-[0.2em] text-xs ${isTerang ? 'text-secondary drop-shadow-[0_0_2px_rgba(249,115,22,0.5)]' : 'text-secondary drop-shadow-[0_0_2px_rgba(99,102,241,0.5)]'}`}>SYS_LIGHT</h3>
           </div>
        </div>
        <div className="flex-1 flex items-center justify-center relative">
           <div className={`absolute inset-0 flex items-center justify-center blur-2xl opacity-20 rounded-full ${isTerang ? 'bg-primary' : 'bg-primary'}`}></div>
           <div className="relative flex items-center">
             <span className={`text-4xl font-mono drop-shadow-[0_0_10px_rgba(249,115,22,0.8)] leading-none ${isTerang ? 'text-secondary' : 'text-secondary'}`}>{isTerang ? "TERANG" : "GELAP"}</span>
           </div>
        </div>
        <div className="mt-4 border-t border-slate-800 pt-4 flex justify-between items-center">
           <span className="text-[9px] font-mono text-slate-500 uppercase">UV_STATUS</span>
           <span className={`font-mono text-sm ${isTerang ? 'text-secondary drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]' : 'text-secondary drop-shadow-[0_0_5px_rgba(99,102,241,0.5)]'}`}>{isTerang ? 'OFF' : 'ON'}</span>
        </div>
      </motion.div>
    );
  }

  if (variant === "neobrutalism") {
    return (
      <motion.div variants={itemVariants} className={`border-4 border-black rounded-xl p-5 flex flex-col h-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] ${isTerang ? 'bg-[#ff90e8]' : 'bg-[#a3e635]'}`}>
        <div className="flex justify-between items-start mb-6 border-b-4 border-black pb-4">
           <div className="flex items-center gap-2">
             <div className="bg-white border-2 border-black p-1 rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
               {isTerang ? <Sun className="w-5 h-5 text-black" fill="black" /> : <Moon className="w-5 h-5 text-black" fill="black" />}
             </div>
             <h3 className="font-black text-black uppercase tracking-widest text-sm">SENSOR CAHAYA</h3>
           </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-4 bg-white border-4 border-black shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.1)] rounded-lg mb-4">
           <div className="flex items-center justify-center">
             <span className="text-5xl font-black text-black tracking-tighter leading-none">{isTerang ? "TERANG" : "GELAP"}</span>
           </div>
           <span className={`text-xs font-bold text-black border-2 border-black px-3 py-1 mt-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rotate-2 ${isTerang ? 'bg-[#ffeb3b]' : 'bg-[#38bdf8]'}`}>
             UV Lamp: {isTerang ? 'OFF' : 'ON'}
           </span>
        </div>
      </motion.div>
    );
  }

  if (variant === "neumorphism") {
    return (
      <motion.div variants={itemVariants} className="bg-[#e0e5ec] dark:bg-slate-800 rounded-3xl p-6 flex flex-col h-full shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(255,255,255,0.05)] border-none">
        <div className="flex justify-between items-center mb-6">
           <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-[#e0e5ec] dark:bg-slate-800 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] ${isTerang ? 'text-primary' : 'text-primary'}`}>
             {isTerang ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
           </div>
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{isTerang ? "Cahaya Cukup" : "Minim Cahaya"}</span>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center">
           <div className="w-28 h-28 rounded-full flex items-center justify-center bg-[#e0e5ec] dark:bg-slate-800 shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,0.5)] dark:shadow-[6px_6px_12px_rgba(0,0,0,0.4),-6px_-6px_12px_rgba(255,255,255,0.05)] mb-4 border-4 border-[#e0e5ec] dark:border-slate-800">
             <span className="text-2xl font-black text-slate-700 dark:text-slate-200">{isTerang ? "TERANG" : "GELAP"}</span>
           </div>
        </div>
        <div className="flex justify-center items-center mt-2">
           <div className="flex items-center gap-2">
             <span className={`w-2 h-2 rounded-full ${isTerang ? 'bg-secondary' : 'bg-secondary'}`}></span>
             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Lampu UV {isTerang ? 'Off' : 'On'}</span>
           </div>
        </div>
      </motion.div>
    );
  }

  // Default UI
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl flex flex-col h-full shadow-sm p-4 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300"
    >
      <div className="flex items-center justify-between border-b border-white/50 dark:border-white/10 pb-3 mb-4">
        <h3 className="font-bold text-text-primary tracking-wide text-xs">SENSOR CAHAYA</h3>
        <span className="text-[10px] text-slate-500 font-medium">RAW: {telemetry.cahaya}</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className={`p-4 rounded-2xl border ${isTerang ? 'bg-primary/10 border-primary/20' : 'bg-primary/10 border-primary/20'} mb-4`}>
          {isTerang ? (
            <Sun className="w-8 h-8 text-primary dark:text-secondary" />
          ) : (
            <Moon className="w-8 h-8 text-primary dark:text-secondary" />
          )}
        </div>
        <h2 className={`text-2xl font-black tracking-tight mb-1 ${isTerang ? 'text-primary dark:text-secondary' : 'text-primary dark:text-secondary'}`}>
          {isTerang ? "TERANG" : "GELAP"}
        </h2>
        <p className="text-[11px] text-slate-500 text-center">
          {isTerang ? "Lampu UV otomatis mati." : "Lampu UV menyala."}
        </p>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/50 dark:border-white/10">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <span className={`w-2 h-2 rounded-full ${isTerang ? 'bg-secondary' : 'bg-secondary'}`}></span>
          Berdasarkan LDR
        </div>
        <div className={`px-2 py-0.5 rounded text-[9px] font-bold border ${isTerang ? 'bg-primary/20 text-primary dark:text-secondary border-primary/20' : 'bg-primary/20 text-primary dark:text-secondary border-primary/20'}`}>
          {isTerang ? "TERIK" : "REDUK"}
        </div>
      </div>
    </motion.div>
  );
}
