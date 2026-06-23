import React from "react";
import { Cpu, Power, Lightbulb, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { SmartPlantData } from "../types";
import { toast } from "sonner";

interface ControlsCardProps {
  telemetry: SmartPlantData;
  publishCommand: (command: string) => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
};

export default function ControlsCard({ telemetry, publishCommand }: ControlsCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      className="flex flex-col h-full min-h-0 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden p-3 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300"
    >
      {/* Header Title */}
      <div className="flex items-center justify-between border-b border-white/50 dark:border-white/10 pb-2 mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-teal-500/10 rounded-lg border border-teal-500/20">
            <Cpu className="w-4 h-4 text-teal-500 dark:text-teal-400" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 tracking-wide text-xs">Mode & Kontrol</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col pr-1 custom-scrollbar">
        {/* Mode Toggle Switch */}
        <div className="bg-white/30 dark:bg-slate-950/30 border border-white/40 dark:border-slate-800/50 rounded-xl p-2.5 flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Mode Sistem</span>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
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
                ? "bg-teal-500/20 text-teal-600 dark:text-teal-400 border-teal-500/40"
                : "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/40"
            }`}
          >
            {telemetry.mode === "AUTO" ? (
              <>
                <span>AUTO</span>
                <span className="w-3 h-3 rounded-full bg-teal-500 dark:bg-teal-400 flex items-center justify-center text-[7px] text-white dark:text-slate-950 font-black">A</span>
              </>
            ) : (
              <>
                <span>MANUAL</span>
                <span className="w-3 h-3 rounded-full bg-indigo-500 dark:bg-indigo-400 flex items-center justify-center text-[7px] text-white dark:text-slate-950 font-black">M</span>
              </>
            )}
          </button>
        </div>

        {/* Actuators Controls */}
        <div className="space-y-2">
          {/* Pump Actuator */}
          <div className="flex items-center justify-between bg-white/20 dark:bg-slate-800/30 p-2 rounded-xl border border-white/30 dark:border-slate-700/50">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
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
                  ? "bg-sky-500 text-white dark:text-slate-950 border-sky-400 shadow-sm shadow-sky-500/20"
                  : "bg-white/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <Power className="w-3 h-3" />
              {telemetry.pompa === 1 ? "ON" : "OFF"}
            </button>
          </div>

          {/* Lamp Actuator */}
          <div className="flex items-center justify-between bg-white/20 dark:bg-slate-800/30 p-2 rounded-xl border border-white/30 dark:border-slate-700/50">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
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
                  ? "bg-purple-500 text-white dark:text-slate-950 border-purple-400 shadow-sm shadow-purple-500/20"
                  : "bg-white/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
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
    </motion.div>
  );
}
