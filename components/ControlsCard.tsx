import React from "react";
import { Cpu, Power, Lightbulb, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { SmartPlantData } from "../types";

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
      className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl flex-1 flex flex-col justify-between hover:border-slate-700/80 transition-all duration-300"
    >
      {/* Header Title */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-teal-400" />
          <h3 className="font-bold text-slate-200 tracking-wide text-sm">Mode & Kontrol Alat</h3>
        </div>
      </div>

      {/* Mode Toggle Switch */}
      <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-3.5 flex items-center justify-between gap-4 mb-4">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-300">Mode Sistem</span>
          <span className="text-[10px] text-slate-400 font-medium mt-0.5">
            {telemetry.mode === "AUTO" ? "Penyiraman Otomatis Aktif" : "Bebas Kontrol Manual"}
          </span>
        </div>

        <button
          onClick={() => {
            const newMode = telemetry.mode === "AUTO" ? "MANUAL" : "AUTO";
            publishCommand(`MODE:${newMode}`);
          }}
          className={`relative w-28 h-9 rounded-xl font-bold text-xs tracking-wider transition-all duration-300 border flex items-center justify-between px-3 ${
            telemetry.mode === "AUTO"
              ? "bg-teal-500/10 text-teal-400 border-teal-500/30"
              : "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
          }`}
        >
          {telemetry.mode === "AUTO" ? (
            <>
              <span>AUTO</span>
              <span className="w-4 h-4 rounded-full bg-teal-400 flex items-center justify-center text-[9px] text-slate-950 font-black">A</span>
            </>
          ) : (
            <>
              <span>MANUAL</span>
              <span className="w-4 h-4 rounded-full bg-indigo-400 flex items-center justify-center text-[9px] text-slate-950 font-black">M</span>
            </>
          )}
        </button>
      </div>

      {/* Actuators Controls */}
      <div className="space-y-3">
        {/* Pump Actuator */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
              Pompa Penyiram
              {telemetry.mode === "AUTO" && <Lock className="w-3 h-3 text-slate-500" />}
            </span>
            <span className="text-[10px] text-slate-500">
              {telemetry.pompa === 1 ? "Menyembur..." : "Mati"}
            </span>
          </div>

          <button
            disabled={telemetry.mode === "AUTO"}
            onClick={() => {
              const cmd = telemetry.pompa === 1 ? "PUMP:OFF" : "PUMP:ON";
              publishCommand(cmd);
            }}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 border ${
              telemetry.pompa === 1
                ? "bg-sky-500 text-slate-950 border-sky-400 shadow-lg shadow-sky-500/20"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            <Power className="w-3.5 h-3.5" />
            {telemetry.pompa === 1 ? "NYALA" : "MATI"}
          </button>
        </div>

        {/* Lamp Actuator */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
              Lampu UV
              {telemetry.mode === "AUTO" && <Lock className="w-3 h-3 text-slate-500" />}
            </span>
            <span className="text-[10px] text-slate-500">
              {telemetry.lampu === 1 ? "Menyinari..." : "Mati"}
            </span>
          </div>

          <button
            disabled={telemetry.mode === "AUTO"}
            onClick={() => {
              const cmd = telemetry.lampu === 1 ? "LAMP:OFF" : "LAMP:ON";
              publishCommand(cmd);
            }}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 border ${
              telemetry.lampu === 1
                ? "bg-purple-500 text-slate-950 border-purple-400 shadow-lg shadow-purple-500/20"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            {telemetry.lampu === 1 ? "NYALA" : "MATI"}
          </button>
        </div>
      </div>

      {/* Manual Lock / Warning Message */}
      {telemetry.mode === "AUTO" && (
        <div className="mt-4 p-2 bg-slate-950/80 border border-slate-900 text-slate-500 text-[10px] rounded-xl text-center font-medium italic flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5" />
          Ubah ke mode MANUAL untuk mengontrol pompa & lampu secara mandiri.
        </div>
      )}
    </motion.div>
  );
}
