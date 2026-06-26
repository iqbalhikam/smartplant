import React from "react";
import { Cpu, Power, Lightbulb, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { SmartPlantData, WidgetVariant } from "../types";
import { toast } from "sonner";

interface ControlsCardProps {
  telemetry: SmartPlantData;
  publishCommand: (command: string) => void;
  variant?: WidgetVariant;
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
};

export default function ControlsCard({ telemetry, publishCommand, variant }: ControlsCardProps) {
  const controlsContent = (
    <div className="flex-1 overflow-y-auto flex flex-col pr-1 custom-scrollbar">
      {/* Mode Toggle Switch */}
      <div className="bg-white/30 dark:bg-background/30 border border-white/40 dark:border-slate-800/50 rounded-xl p-2.5 flex items-center justify-between gap-2 mb-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-text-primary">Mode Sistem</span>
          <span className="text-[9px] text-text-secondary font-medium">
            {telemetry.mode === "AUTO" ? "AI Otomatis" : "Manual"}
          </span>
        </div>

        <button
          onClick={() => {
            const newMode = telemetry.mode === "AUTO" ? "MANUAL" : "AUTO";
            publishCommand(`MODE:${newMode}`);
            toast.success(`Mode sistem diubah ke ${newMode}`);
          }}
          className={`relative w-24 h-7 rounded-lg font-bold text-[9px] tracking-wider transition-all duration-300 border flex items-center justify-between px-2 ${
            telemetry.mode === "AUTO"
              ? "bg-primary/20 text-primary dark:text-secondary border-primary/40"
              : "bg-primary/20 text-primary dark:text-secondary border-primary/40"
          }`}
        >
          {telemetry.mode === "AUTO" ? (
            <>
              <span>AUTO</span>
              <span className="w-3 h-3 rounded-full bg-primary dark:bg-secondary flex items-center justify-center text-[7px] text-white dark:text-slate-950 font-black">A</span>
            </>
          ) : (
            <>
              <span>MANUAL</span>
              <span className="w-3 h-3 rounded-full bg-primary dark:bg-secondary flex items-center justify-center text-[7px] text-white dark:text-slate-950 font-black">M</span>
            </>
          )}
        </button>
      </div>

      {/* Actuators Controls */}
      <div className="space-y-2">
        {/* Pump Actuator */}
        <div className="flex items-center justify-between bg-white/20 dark:bg-slate-800/30 p-2 rounded-xl border border-white/30 dark:border-slate-700/50">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-text-primary flex items-center gap-1">
              Pompa Air
              {telemetry.mode === "AUTO" && <Lock className="w-2.5 h-2.5 text-slate-400 dark:text-slate-500" />}
            </span>
            <span className="text-[9px] text-slate-500">
              {telemetry.pompa === 1 ? "Menyala" : "Mati"}
            </span>
          </div>

          <button
            disabled={telemetry.mode === "AUTO"}
            onClick={() => {
              const cmd = telemetry.pompa === 1 ? "PUMP:OFF" : "PUMP:ON";
              publishCommand(cmd);
            }}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[9px] transition-all duration-300 border ${
              telemetry.pompa === 1
                ? "bg-primary text-white dark:text-slate-950 border-secondary shadow-sm shadow-primary/20"
                : "bg-surface border-border text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-800"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <Power className="w-3 h-3" />
            {telemetry.pompa === 1 ? "ON" : "OFF"}
          </button>
        </div>

        {/* Lamp Actuator */}
        <div className="flex items-center justify-between bg-white/20 dark:bg-slate-800/30 p-2 rounded-xl border border-white/30 dark:border-slate-700/50">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-text-primary flex items-center gap-1">
              Lampu UV
              {telemetry.mode === "AUTO" && <Lock className="w-2.5 h-2.5 text-slate-400 dark:text-slate-500" />}
            </span>
            <span className="text-[9px] text-slate-500">
              {telemetry.lampu === 1 ? "Menyala" : "Mati"}
            </span>
          </div>

          <button
            disabled={telemetry.mode === "AUTO"}
            onClick={() => {
              const cmd = telemetry.lampu === 1 ? "LAMP:OFF" : "LAMP:ON";
              publishCommand(cmd);
            }}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[9px] transition-all duration-300 border ${
              telemetry.lampu === 1
                ? "bg-primary text-white dark:text-slate-950 border-secondary shadow-sm shadow-primary/20"
                : "bg-surface border-border text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-800"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <Lightbulb className="w-3 h-3" />
            {telemetry.lampu === 1 ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* Manual Lock / Warning Message */}
      {telemetry.mode === "AUTO" && (
        <div className="mt-auto pt-2">
          <div className="p-1.5 bg-slate-500/10 border border-slate-500/20 text-slate-500 text-[9px] rounded-lg text-center font-medium italic flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            Terkunci mode AUTO.
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (variant === "minimal") {
      return (
        <div className="bg-transparent border-l-4 border-primary pl-4 py-2 flex flex-col h-full pointer-events-auto">
          <div className="flex items-center gap-2 mb-3 opacity-80">
            <Cpu className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Kontrol Sistem</h2>
          </div>
          {controlsContent}
        </div>
      );
    }

    if (variant === "glassmorphism") {
      return (
        <div className="bg-surface backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] h-full flex flex-col relative overflow-hidden pointer-events-auto">
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full bg-primary/20 blur-2xl"></div>
          <div className="flex items-center gap-3 mb-3 z-10">
            <div className="w-10 h-10 rounded-full flex items-center justify-center border border-white/30 bg-gradient-to-br from-secondary/30 to-secondary/10 shadow-[0_0_20px_rgba(99,102,241,0.2)] shrink-0">
              <Cpu className="w-5 h-5 text-primary dark:text-secondary" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide text-slate-700 dark:text-slate-200">KONTROL</h2>
              <p className="text-[9px] opacity-70">Sistem Aktuator</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col relative z-10">
            {controlsContent}
          </div>
        </div>
      );
    }

    if (variant === "solid") {
      return (
        <div className="bg-gradient-to-br from-secondary to-primary rounded-2xl p-4 shadow-xl shadow-primary/30 h-full flex flex-col relative overflow-hidden pointer-events-auto">
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
          <div className="flex items-center gap-2 border-b border-white/20 pb-2 mb-3 z-10 text-white">
            <Cpu className="w-5 h-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider drop-shadow-sm">Sistem Kontrol</h2>
          </div>
          <div className="flex-1 flex flex-col bg-surface rounded-xl p-3 shadow-inner relative z-10">
            {controlsContent}
          </div>
        </div>
      );
    }

    if (variant === "neon") {
      return (
        <div className="bg-background border border-primary/50 rounded-xl p-4 flex flex-col h-full relative overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.3),inset_0_0_20px_rgba(99,102,241,0.1)] pointer-events-auto">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-70"></div>
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-5 h-5 text-secondary drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            <h3 className="font-mono text-secondary uppercase tracking-[0.2em] text-xs drop-shadow-[0_0_2px_rgba(99,102,241,0.5)]">SYS_CONTROL</h3>
          </div>
          <div className="flex-1 flex flex-col relative z-10 border border-primary/30 rounded-lg p-2 bg-indigo-950/30">
            {controlsContent}
          </div>
        </div>
      );
    }

    if (variant === "neobrutalism") {
      return (
        <div className="border-4 border-black rounded-xl p-4 flex flex-col h-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-[#ffeb3b] pointer-events-auto">
          <div className="flex items-center gap-2 mb-3 border-b-4 border-black pb-3">
             <div className="bg-white border-2 border-black p-1 rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
               <Cpu className="w-4 h-4 text-black" />
             </div>
             <h3 className="font-black text-black uppercase tracking-widest text-sm">KONTROL</h3>
          </div>
          <div className="flex-1 flex flex-col bg-white border-4 border-black shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.1)] rounded-lg p-2 relative">
            {controlsContent}
          </div>
        </div>
      );
    }

    if (variant === "neumorphism") {
      return (
        <div className="bg-[#e0e5ec] dark:bg-slate-800 rounded-3xl p-5 flex flex-col h-full shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(255,255,255,0.05)] border-none pointer-events-auto">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#e0e5ec] dark:bg-slate-800 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] text-primary shrink-0">
               <Cpu className="w-4 h-4" />
             </div>
             <div>
               <h3 className="font-bold text-slate-600 dark:text-slate-300 tracking-widest text-xs uppercase">Sistem Aktuator</h3>
             </div>
          </div>
          <div className="flex-1 flex flex-col rounded-2xl bg-[#e0e5ec] dark:bg-slate-800 shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,0.5)] dark:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.4),inset_-6px_-6px_12px_rgba(255,255,255,0.05)] border-4 border-[#e0e5ec] dark:border-slate-800 p-3 relative">
            {controlsContent}
          </div>
        </div>
      );
    }

    // Default UI
    return (
      <div className="flex flex-col h-full min-h-0 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden p-3 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300 pointer-events-auto">
        <div className="flex items-center gap-2 border-b border-white/50 dark:border-white/10 pb-2 mb-2 shrink-0">
          <div className="p-1.5 bg-primary/10 rounded-lg border border-primary/20">
            <Cpu className="w-4 h-4 text-primary dark:text-secondary" />
          </div>
          <h3 className="font-bold text-text-primary tracking-wide text-xs">Mode & Kontrol</h3>
        </div>
        {controlsContent}
      </div>
    );
  };

  return (
    <motion.div variants={itemVariants} className="h-full">
      {renderContent()}
    </motion.div>
  );
}
