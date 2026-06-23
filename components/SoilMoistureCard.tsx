import React, { useState, useEffect } from "react";
import { Droplet, Thermometer, Leaf, Cloud, Cable, PowerOff } from "lucide-react";
import { motion } from "framer-motion";
import { SmartPlantData } from "../types";

interface SoilMoistureCardProps {
  telemetry: SmartPlantData;
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
};

const getTanahStatus = (val: number, basah: number, kering: number) => {
  const range = kering - basah;
  const percentage = range !== 0 ? (val - basah) / range : 0;
  if (percentage > 0.8) return { label: "SANGAT KERING", className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" };
  if (percentage > 0.5) return { label: "KERING", className: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20" };
  if (percentage > 0.2) return { label: "LEMBAP", className: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20" };
  return { label: "BASAH", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" };
};

const getSuhuStatus = (suhu: number | undefined) => {
  if (suhu === undefined || suhu === -1) return { label: "TIDAK AKTIF", className: "bg-slate-500/10 text-slate-500 border-slate-500/20" };
  if (suhu < 25) return { label: "DINGIN", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" };
  if (suhu <= 30) return { label: "NORMAL", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
  if (suhu <= 35) return { label: "PANAS", className: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20" };
  return { label: "SANGAT PANAS", className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" };
};

const getHumidityStatus = (humidity: number | undefined) => {
  if (humidity === undefined || humidity === -1) return { label: "TIDAK AKTIF", className: "bg-slate-500/10 text-slate-500 border-slate-500/20" };
  if (humidity < 40) return { label: "KERING", className: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20" };
  if (humidity <= 70) return { label: "NORMAL", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
  return { label: "LEMBAP", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" };
};

export default function SoilMoistureCard({ telemetry }: SoilMoistureCardProps) {
  const getSoilStatus = (tanah: number, mode: string, rule: string) => {
    const cBasah = telemetry?.calBasah ?? 0;
    const cKering = telemetry?.calKering ?? 4095;

    const clampedValue = Math.max(
      cBasah,
      Math.min(cKering, tanah)
    );

    const percent =
      ((cKering - clampedValue) /
        (cKering - cBasah || 1)) * 
      100;

    const percentage = Math.round(percent);

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

  const tanahStatus = getTanahStatus(telemetry.tanah, telemetry.calBasah || 1500, telemetry.calKering || 3500);
  const suhuStatus = getSuhuStatus(telemetry.suhu);
  const humidityStatus = getHumidityStatus(telemetry.humidity);
  
  const isDhtMissing = telemetry.suhu === -1 || telemetry.humidity === -1;

  return (
    <motion.div
      variants={itemVariants}
      className={`flex flex-col h-full min-h-0 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden p-3 ${soilMetrics.bgGlow}`}
    >
      <div className="flex-1 overflow-y-auto flex flex-col pr-1 custom-scrollbar">
        <div className="flex items-center justify-between border-b border-white/50 dark:border-white/10 pb-2 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <Leaf className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 dark:text-slate-200 tracking-wide text-xs uppercase">Kondisi Ekosistem</h2>
              <p className="text-[9px] text-slate-500 dark:text-slate-400">Iklim Mikro & Tanah</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-md text-[9px] font-black tracking-widest uppercase ${soilMetrics.badgeBg} shadow-sm ${telemetry.mode === "AUTO" ? "animate-pulse" : ""}`}>
            {soilMetrics.label}
          </span>
        </div>

        <div className="flex flex-col gap-3 flex-1 mb-2">
          {/* Soil Moisture Gauge Panel */}
          <div className="w-full flex items-center justify-between p-3 bg-white/20 dark:bg-slate-900/30 rounded-xl border border-white/30 dark:border-slate-700/50 shadow-inner group">
            <div className="flex flex-col gap-1 w-1/2">
              <div className="flex items-center gap-1.5 mb-1">
                <Droplet className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">Tanah</span>
              </div>
              <div className="flex items-end">
                <span className="text-3xl font-extrabold tracking-tight bg-linear-to-b from-slate-900 to-slate-600 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                  {soilMetrics.percentage}
                </span>
                <span className="text-sm font-bold text-slate-400 mb-1 ml-1">%</span>
              </div>
              <div>
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${tanahStatus.className}`}>
                  {tanahStatus.label}
                </span>
              </div>
            </div>

            <div className="w-24 relative transition-transform duration-500 group-hover:scale-105 shrink-0">
              <svg viewBox="0 0 100 55" className="w-full drop-shadow-md">
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
            </div>
          </div>

          {/* Temperature & Humidity Side by Side */}
          <div className="grid grid-cols-2 gap-3">
            {/* Suhu Panel */}
            <div className="flex flex-col p-3 bg-white/20 dark:bg-slate-900/30 rounded-xl border border-white/30 dark:border-slate-700/50 shadow-inner group">
              <div className="flex items-center gap-1.5 mb-2">
                <Thermometer className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">Suhu Udara</span>
              </div>
              <div className="flex items-end mb-1">
                <span className={`text-2xl font-black tracking-tight ${!isDhtMissing ? 'text-orange-500 dark:text-orange-400' : 'text-slate-400'}`}>
                  {!isDhtMissing ? (telemetry.suhu || 0).toFixed(1) : "--"}
                </span>
                <span className={`text-xs font-bold mb-1 ml-1 ${!isDhtMissing ? 'text-orange-400/70' : 'text-slate-400/70'}`}>
                  °C
                </span>
              </div>
              <div>
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${suhuStatus.className}`}>
                  {suhuStatus.label}
                </span>
              </div>
            </div>

            {/* Kelembapan Udara Panel */}
            <div className="flex flex-col p-3 bg-white/20 dark:bg-slate-900/30 rounded-xl border border-white/30 dark:border-slate-700/50 shadow-inner group">
              <div className="flex items-center gap-1.5 mb-2">
                <Cloud className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">Udara Sekitar</span>
              </div>
              <div className="flex items-end mb-1">
                <span className={`text-2xl font-black tracking-tight ${!isDhtMissing ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400'}`}>
                  {!isDhtMissing ? (telemetry.humidity || 0).toFixed(1) : "--"}
                </span>
                <span className={`text-xs font-bold mb-1 ml-1 ${!isDhtMissing ? 'text-blue-400/70' : 'text-slate-400/70'}`}>
                  %
                </span>
              </div>
              <div>
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${humidityStatus.className}`}>
                  {humidityStatus.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[9px] text-slate-500 dark:text-slate-400 text-center px-2 mb-2 font-medium italic leading-relaxed shrink-0">
          "{soilMetrics.desc}"
        </p>

        <div className="flex justify-between items-center mt-auto text-[8px] font-mono text-slate-500 dark:text-slate-400 bg-white/30 dark:bg-slate-950/20 px-2 py-1.5 rounded-lg border border-white/40 dark:border-slate-800/40 shrink-0">
          <div className="flex items-center gap-1">
            <span className="font-bold uppercase">Sensor Tanah:</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">{telemetry?.tanah ?? 0}</span>
            <span className="opacity-70">/ {telemetry?.calKering ?? 4095}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              &lt;{telemetry.batasBasah}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              &gt;{telemetry.batasKering}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}