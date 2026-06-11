import React from "react";
import { Droplet } from "lucide-react";
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
  const getSoilStatus = (tanah: number, mode: string, rule: string) => {
    const rawPercent = ((4095 - tanah) / 4095) * 100;
    const percentage = Math.max(0, Math.min(100, Math.round(rawPercent)));

    // 1. Status Manual
    if (mode === "MANUAL") {
      return {
        percentage,
        label: "MANUAL",
        gaugeColor: "#94a3b8", 
        glowClass: "shadow-slate-500/20 border-slate-500/30",
        bgGlow: "bg-slate-500/5",
        badgeBg: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
        desc: "Fuzzy Logic Nonaktif. Sistem dalam kendali manual."
      };
    }

    // 2. Status Menyiram (Kritis/Kering) - PERBAIKAN EXACT MATCH
    if (["R1", "R2", "R4", "R6", "R7", "R8"].includes(rule)) {
      return {
        percentage,
        label: "MENYIRAM...",
        gaugeColor: "#38bdf8", 
        glowClass: "shadow-sky-500/20 border-sky-500/30",
        bgGlow: "bg-sky-500/5",
        badgeBg: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
        desc: "Mendeteksi Kekeringan: Memulai penyiraman terukur."
      };
    }

    // 3. Status Menyalakan UV - PERBAIKAN EXACT MATCH (Tidak akan salah baca R13 lagi)
    if (["R3", "R9", "R14", "R17"].includes(rule)) {
      return {
        percentage,
        label: "MODE UV",
        gaugeColor: "#a855f7", 
        glowClass: "shadow-purple-500/20 border-purple-500/30",
        bgGlow: "bg-purple-500/5",
        badgeBg: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
        desc: "Cahaya minim. Menyalakan lampu UV cadangan."
      };
    }

    // 4. Status Aman / Tahan Penyiraman - PERBAIKAN EXACT MATCH
    if (["R_STOP", "R15", "R16", "R18", "R19", "R20", "R18/20", "R16/19"].includes(rule)) {
      return {
        percentage,
        label: "DITAHAN",
        gaugeColor: "#10b981", 
        glowClass: "shadow-emerald-500/20 border-emerald-500/30",
        bgGlow: "bg-emerald-500/5",
        badgeBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        desc: "Kelembapan ideal. Penyiraman ditahan otomatis."
      };
    }

    // 5. Status Idle / Memantau (Aturan Default & R10, R11, R12, R13 akan masuk ke sini)
    return {
      percentage,
      label: "MEMANTAU",
      gaugeColor: "#60a5fa", 
      glowClass: "shadow-blue-500/20 border-blue-500/30",
      bgGlow: "bg-blue-500/5",
      badgeBg: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
      desc: "Kondisi seimbang. AI memantau data sensor..."
    };
  };

  const soilMetrics = getSoilStatus(
    telemetry.tanah,
    telemetry.mode,
    telemetry.rule || "IDLE"
  );

  return (
    <motion.div
      variants={itemVariants}
      className={`bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl transition-all duration-500 flex flex-col justify-between ${soilMetrics.glowClass} ${soilMetrics.bgGlow}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl">
            <Droplet className="w-5 h-5 text-teal-500 dark:text-teal-400" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 dark:text-slate-200 tracking-wide text-sm">Kelembapan Tanah</h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Status kadar air dalam tanah</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider ${soilMetrics.badgeBg} shadow-sm ${telemetry.mode === "AUTO" ? "animate-pulse" : ""}`}>
          {soilMetrics.label}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 my-4 relative">
        <div className="w-full max-w-[260px] relative">
          <svg viewBox="0 0 100 55" className="w-full">
            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="url(#soil-gauge-gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="125.66"
              strokeDashoffset={125.66 - (125.66 * soilMetrics.percentage) / 100}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="soil-gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#14b8a6" />
                <stop offset="50%" stopColor={soilMetrics.gaugeColor} />
                <stop offset="100%" stopColor={soilMetrics.gaugeColor} />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute bottom-1.5 left-0 right-0 text-center flex flex-col items-center">
            <span className="text-4xl font-extrabold tracking-tight bg-linear-to-b from-slate-900 to-slate-600 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
              {soilMetrics.percentage}%
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">Kelembapan</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 text-center px-4 mb-4 font-medium italic">
        "{soilMetrics.desc}"
      </p>

      <div className="flex justify-between items-center mt-4 text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950/20 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800/40">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase">Nilai Sensor:</span>
          <span className="text-slate-800 dark:text-slate-200 font-bold">{telemetry.tanah}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-600">/ 4095</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            &lt;{telemetry.batasBasah}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            &gt;{telemetry.batasKering}
          </span>
        </div>
      </div>
    </motion.div>
  );
}