import React, { useState, useEffect } from 'react';
import { Clock } from "lucide-react";
import { WidgetVariant } from '../types';

interface ClockWidgetProps {
  variant?: WidgetVariant;
}

export default function ClockWidget({ variant }: ClockWidgetProps) {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) {
    return (
      <div className="bg-gradient-to-br from-secondary to-primary rounded-2xl p-6 shadow-xl h-full flex flex-col justify-center items-center text-white">
        <Clock className="w-8 h-8 opacity-50 animate-pulse" />
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className="bg-transparent border-l-4 border-primary pl-4 py-2 flex flex-col h-full justify-between pointer-events-auto">
        <div className="flex items-center gap-2 mb-2 opacity-80">
          <Clock className="w-4 h-4 text-primary" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Waktu</h2>
        </div>
        <div className="flex flex-col justify-center mt-auto">
          <div className="text-5xl font-light font-mono tracking-tighter text-slate-800 dark:text-slate-100">
            {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <p className="text-xs font-medium mt-1 text-slate-400">
            {time.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    );
  }

  if (variant === "glassmorphism") {
    return (
      <div className="bg-surface backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] h-full flex flex-col items-center justify-center relative overflow-hidden pointer-events-auto">
        <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full bg-primary/20 blur-2xl"></div>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 border border-white/30 bg-gradient-to-br from-secondary/30 to-secondary/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
          <Clock className="w-7 h-7 text-primary dark:text-secondary drop-shadow-sm" />
        </div>
        <div className="text-4xl font-black font-mono tracking-tighter drop-shadow-sm bg-clip-text text-transparent bg-gradient-to-br from-secondary to-primary dark:from-secondary dark:to-secondary">
          {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <p className="text-xs font-medium mt-2 text-text-secondary uppercase tracking-widest">
          {time.toLocaleDateString('id-ID', { weekday: 'short', month: 'short', day: 'numeric' })}
        </p>
      </div>
    );
  }

  if (variant === "solid") {
    return (
      <div className="bg-gradient-to-br from-secondary to-primary rounded-2xl p-6 shadow-xl shadow-primary/30 h-full flex flex-col relative overflow-hidden pointer-events-auto">
        <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-24 h-24 rounded-full bg-black/10 blur-xl"></div>
        <div className="flex items-center gap-2 mb-2 z-10 text-white">
          <Clock className="w-4 h-4 drop-shadow-sm" />
          <h2 className="text-sm font-bold uppercase tracking-wider drop-shadow-sm">Waktu Sistem</h2>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center z-10 text-white">
          <div className="text-5xl font-black font-mono tracking-tighter drop-shadow-md flex items-baseline">
            {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            <span className="text-xl ml-1 opacity-80">{time.getSeconds().toString().padStart(2, '0')}</span>
          </div>
          <p className="text-xs font-medium mt-2 text-white/80">
            {time.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    );
  }

  if (variant === "neon") {
    return (
      <div className="bg-background border border-primary/50 rounded-xl p-5 flex flex-col h-full relative overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.3),inset_0_0_20px_rgba(99,102,241,0.1)] pointer-events-auto">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-70"></div>
        <div className="flex justify-between items-start mb-6">
           <div className="flex items-center gap-2">
             <Clock className="w-5 h-5 text-secondary drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
             <h3 className="font-mono text-secondary uppercase tracking-[0.2em] text-xs drop-shadow-[0_0_2px_rgba(99,102,241,0.5)]">SYS_CLOCK</h3>
           </div>
        </div>
        <div className="flex-1 flex items-center justify-center relative">
           <div className="absolute inset-0 flex items-center justify-center blur-2xl opacity-20 bg-primary rounded-full"></div>
           <div className="relative flex flex-col items-center">
             <span className="text-5xl font-mono text-secondary drop-shadow-[0_0_10px_rgba(165,180,252,0.8)] leading-none">
               {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
             </span>
             <span className="text-xs font-mono text-primary mt-2">
               {time.toLocaleDateString('id-ID', { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit' })}
             </span>
           </div>
        </div>
      </div>
    );
  }

  if (variant === "neobrutalism") {
    return (
      <div className="border-4 border-black rounded-xl p-5 flex flex-col h-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-[#a3e635] pointer-events-auto">
        <div className="flex justify-between items-start mb-6 border-b-4 border-black pb-4">
           <div className="flex items-center gap-2">
             <div className="bg-white border-2 border-black p-1 rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
               <Clock className="w-5 h-5 text-black" fill="black" />
             </div>
             <h3 className="font-black text-black uppercase tracking-widest text-sm">WAKTU</h3>
           </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-4 bg-white border-4 border-black shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.1)] rounded-lg mb-4">
           <span className="text-5xl font-black text-black tracking-tighter leading-none font-mono">
             {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
           </span>
           <span className="text-[10px] font-bold text-black border-2 border-black px-3 py-1 mt-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -rotate-2 bg-[#ff90e8] uppercase">
             {time.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
           </span>
        </div>
      </div>
    );
  }

  if (variant === "neumorphism") {
    return (
      <div className="bg-[#e0e5ec] dark:bg-slate-800 rounded-3xl p-6 flex flex-col h-full shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(255,255,255,0.05)] border-none pointer-events-auto">
        <div className="flex justify-between items-center mb-6">
           <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#e0e5ec] dark:bg-slate-800 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] text-primary">
             <Clock className="w-4 h-4" />
           </div>
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Jam Digital</span>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center">
           <div className="w-40 h-24 rounded-2xl flex items-center justify-center bg-[#e0e5ec] dark:bg-slate-800 shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,0.5)] dark:shadow-[6px_6px_12px_rgba(0,0,0,0.4),-6px_-6px_12px_rgba(255,255,255,0.05)] border-4 border-[#e0e5ec] dark:border-slate-800 px-4">
             <span className="text-3xl font-black text-slate-700 dark:text-slate-200 font-mono tracking-widest">{time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
           </div>
        </div>
      </div>
    );
  }

  // Default UI
  return (
    <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl flex flex-col h-full shadow-sm p-4 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300 pointer-events-auto">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-primary/10 rounded-lg border border-primary/20">
          <Clock className="w-4 h-4 text-primary dark:text-secondary" />
        </div>
        <h3 className="font-bold text-text-primary tracking-wide text-xs">WAKTU SISTEM</h3>
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white font-mono tracking-tighter mb-1">
          {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          <span className="text-lg md:text-xl text-text-secondary ml-1">
            {time.getSeconds().toString().padStart(2, '0')}
          </span>
        </div>
        <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
          {time.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </div>
  );
}
