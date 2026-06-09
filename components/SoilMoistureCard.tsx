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
  const getSoilStatus = (tanah: number, dryLimit: number, wetLimit: number, isPumping: boolean) => {
    const rawPercent = ((4095 - tanah) / 4095) * 100;
    const percentage = Math.max(0, Math.min(100, Math.round(rawPercent)));

    if (isPumping) {
      return {
        percentage,
        label: "MENYIRAM...",
        colorClass: "text-sky-400",
        gaugeColor: "#38bdf8",
        glowClass: "shadow-sky-500/20 border-sky-500/30",
        bgGlow: "bg-sky-500/5",
        badgeBg: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
        desc: "Sistem sedang menyemprotkan air ke tanah."
      };
    }

    if (tanah <= wetLimit) {
      return {
        percentage,
        label: "SUBUR/AMAN",
        colorClass: "text-emerald-400",
        gaugeColor: "#10b981",
        glowClass: "shadow-emerald-500/20 border-emerald-500/30",
        bgGlow: "bg-emerald-500/5",
        badgeBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        desc: "Kandungan air tanah melimpah dan optimal."
      };
    } else if (tanah >= dryLimit) {
      return {
        percentage,
        label: "KERING/HAUS",
        colorClass: "text-rose-500",
        gaugeColor: "#f43f5e",
        glowClass: "shadow-rose-500/20 border-rose-500/30",
        bgGlow: "bg-rose-500/5",
        badgeBg: "bg-rose-500/10 text-rose-500 border border-rose-500/20",
        desc: "Tanah sangat kering! Segera lakukan penyiraman."
      };
    } else {
      return {
        percentage,
        label: "BUTUH AIR",
        colorClass: "text-amber-400",
        gaugeColor: "#f59e0b",
        glowClass: "shadow-amber-500/20 border-amber-500/30",
        bgGlow: "bg-amber-500/5",
        badgeBg: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        desc: "Kadar air mulai menyusut. Mendekati batas kering."
      };
    }
  };

  const soilMetrics = getSoilStatus(
    telemetry.tanah,
    telemetry.batasKering,
    telemetry.batasBasah,
    telemetry.pompa === 1
  );

  return (
    <motion.div
      variants={itemVariants}
      className={`bg-slate-900/40 border backdrop-blur-xl rounded-2xl p-6 shadow-2xl transition-all duration-500 flex flex-col justify-between ${soilMetrics.glowClass} ${soilMetrics.bgGlow}`}
    >
      {/* Card Title & Badges */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-950/80 border border-slate-800 rounded-xl">
            <Droplet className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h2 className="font-bold text-slate-200 tracking-wide text-sm">Kelembapan Tanah</h2>
            <p className="text-[10px] text-slate-400">Status kadar air dalam tanah</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider ${soilMetrics.badgeBg} shadow-sm animate-pulse`}>
          {soilMetrics.label}
        </span>
      </div>

      {/* Arc Gauge Visualizer */}
      <div className="flex flex-col items-center justify-center flex-1 my-4 relative">
        <div className="w-full max-w-[260px] relative">
          <svg viewBox="0 0 100 55" className="w-full">
            {/* Grey Base Arc */}
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#1e293b"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Active Progress Arc */}
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
            {/* Gradient definition */}
            <defs>
              <linearGradient id="soil-gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#14b8a6" />
                <stop offset="50%" stopColor={soilMetrics.gaugeColor} />
                <stop offset="100%" stopColor={soilMetrics.gaugeColor} />
              </linearGradient>
            </defs>
          </svg>

          {/* Percentage text in the center */}
          <div className="absolute bottom-1.5 left-0 right-0 text-center flex flex-col items-center">
            <span className="text-4xl font-extrabold tracking-tight bg-linear-to-b from-white to-slate-200 bg-clip-text text-transparent">
              {soilMetrics.percentage}%
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Kelembapan</span>
          </div>
        </div>
      </div>

      {/* Subtitle & Info */}
      <p className="text-xs text-slate-400 text-center px-4 mb-4 font-medium italic">
        "{soilMetrics.desc}"
      </p>

      {/* Bottom info bar */}
      <div className="flex justify-between items-center mt-4 text-xs font-mono text-slate-400 bg-slate-950/20 px-3 py-2 rounded-xl border border-slate-800/40">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Nilai Sensor:</span>
          <span className="text-slate-200 font-bold">{telemetry.tanah}</span>
          <span className="text-[10px] text-slate-600">/ 4095</span>
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
