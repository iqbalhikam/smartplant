import React from "react";
import { BrainCircuit, Sun, PowerOff, Droplets, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SmartPlantData } from "../types";

interface AIFuzzyStatusCardProps {
  telemetry: SmartPlantData | null;
}

// 1. Dictionary / Mapping Rules
const getFuzzyRuleDetails = (rule: string) => {
  if (rule === "IDLE") return { kondisi: "Memantau Lingkungan", aksiPompa: "Mati (Standby)", aksiLampu: "Mati", warna: "text-slate-400", pompaGlow: false, lampuGlow: false };
  if (rule === "COOLDOWN") return { kondisi: "Fase Istirahat AI", aksiPompa: "Mati (Jeda)", aksiLampu: "Mati", warna: "text-amber-500", pompaGlow: false, lampuGlow: false };
  if (rule === "R_DEF_SK") return { kondisi: "Sangat Kering (Default) - Siram Sedang", aksiPompa: "Menyiram Sedang", aksiLampu: "Auto", warna: "text-rose-500", pompaGlow: true, lampuGlow: false };
  if (rule === "R_DEF_K") return { kondisi: "Kering (Default) - Siram Sedikit", aksiPompa: "Menyiram Sedikit", aksiLampu: "Auto", warna: "text-orange-500", pompaGlow: true, lampuGlow: false };
  if (rule === "R_DEF_L") return { kondisi: "Lembap (Default) - Stop Penyiraman", aksiPompa: "Mati (Stop)", aksiLampu: "Auto", warna: "text-teal-500", pompaGlow: false, lampuGlow: false };

  // Stop conditions
  if (rule.includes("R_STOP") || /^R(1[2-9]|20)$/.test(rule)) {
    return { kondisi: "Tanah Basah / Cuaca Tidak Mendukung - Pompa Siaga (Stop)", aksiPompa: "Mati (Stop)", aksiLampu: "Auto", warna: "text-blue-500", pompaGlow: false, lampuGlow: false };
  }

  // Handle new suffixes for 4D Fuzzy
  if (rule.includes("-A")) {
    return { kondisi: "(Udara Kering) -> Tingkatkan Air", aksiPompa: "Menyiram Ekstra", aksiLampu: "Auto", warna: "text-rose-500", pompaGlow: true, lampuGlow: false };
  }
  if (rule.includes("-B")) {
    return { kondisi: "(Udara Normal) -> Air Standar", aksiPompa: "Menyiram Normal", aksiLampu: "Auto", warna: "text-orange-500", pompaGlow: true, lampuGlow: false };
  }
  if (rule.includes("-C")) {
    return { kondisi: "(Udara Lembap) -> Kurangi Air", aksiPompa: "Menyiram Sedikit", aksiLampu: "Auto", warna: "text-teal-500", pompaGlow: true, lampuGlow: false };
  }

  // Fallback for any other watering rule
  if (/^R[1-9]$|^R1[0-1]$/.test(rule)) {
    return { kondisi: "AI Mendeteksi Kekeringan", aksiPompa: "Menyiram", aksiLampu: "Auto", warna: "text-blue-500", pompaGlow: true, lampuGlow: false };
  }

  return { kondisi: "Menganalisis data...", aksiPompa: "Mati", aksiLampu: "Mati", warna: "text-slate-500", pompaGlow: false, lampuGlow: false };
};

// 2. Helper categories for Section A (Fuzzifikasi)
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

const getCahayaStatus = (cahaya: number) => {
  if (cahaya === 0) return { label: "TERIK", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" };
  return { label: "GELAP", className: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" };
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
};

export default function AIFuzzyStatusCard({ telemetry }: AIFuzzyStatusCardProps) {
  const isManual = telemetry?.mode === "MANUAL";
  const rule = telemetry?.rule || "IDLE";
  
  const details = getFuzzyRuleDetails(rule);
  
  const tanahStatus = getTanahStatus(telemetry?.tanah || 0, telemetry?.calBasah || 1500, telemetry?.calKering || 3500);
  const suhuStatus = getSuhuStatus(telemetry?.suhu);
  const cahayaStatus = getCahayaStatus(telemetry?.cahaya || 1);

  return (
    <motion.div
      variants={itemVariants}
      className="flex flex-col h-full min-h-0 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden p-3 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700/50 pb-2 mb-3 shrink-0">
        <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20 shadow-inner">
          <BrainCircuit className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="font-semibold text-sm tracking-wide">Fuzzy Logic Expert</h3>
          <p className="text-[10px] opacity-70">Keputusan AI Berdasarkan Sensor</p>
        </div>
      </div>

      {/* Manual Mode Overlay */}
      <AnimatePresence>
        {isManual && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 backdrop-blur-md bg-white/40 dark:bg-slate-900/40 flex flex-col items-center justify-center rounded-2xl border border-slate-200/50 dark:border-slate-700/50"
          >
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-2 shadow-lg">
              <PowerOff className="w-6 h-6 text-slate-400" />
            </div>
            <h4 className="font-bold text-sm">Fuzzy Logic Nonaktif</h4>
            <p className="text-[10px] mt-1 px-4 text-center opacity-70">Mode manual aktif. AI diabaikan.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`flex-1 flex flex-col justify-between min-h-0 ${isManual ? "opacity-30 pointer-events-none filter blur-[2px] transition-all" : "transition-all"}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={rule}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* Inferensi (Proses AI) */}
            <div className="mb-2 p-2 bg-white/30 dark:bg-slate-900/30 rounded-lg border border-white/20 dark:border-slate-700/40 shadow-sm relative overflow-hidden shrink-0">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-lg"></div>
              <p className="text-[10px] opacity-70 mb-1 flex items-center gap-1">
                Sistem Memutuskan <span className="px-1 py-0.5 bg-white/50 dark:bg-slate-800/50 rounded font-mono font-bold">{rule}</span> :
              </p>
              <p className={`text-xs font-semibold leading-snug ${details.warna}`}>
                "{details.kondisi}"
              </p>
            </div>

            {/* Defuzzifikasi */}
            <div className="flex-1 flex flex-col min-h-0">
              <p className="text-[10px] font-semibold opacity-60 uppercase tracking-wider mb-1">Output Keputusan</p>
              <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
                {/* Panel Pompa */}
                <div className={`p-2 rounded-lg border flex flex-col items-center justify-center text-center transition-all duration-500 ${details.pompaGlow ? "bg-blue-500/10 dark:bg-blue-900/20 border-blue-400/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]" : "bg-white/20 dark:bg-slate-800/30 border-white/20 dark:border-slate-700/50"}`}>
                  <Droplets className={`w-5 h-5 mb-1 transition-colors ${details.pompaGlow ? "text-blue-500 animate-pulse" : "opacity-50"}`} />
                  <span className="text-[9px] font-medium uppercase tracking-wider opacity-70">Pompa Air</span>
                  <span className={`text-xs font-bold mt-0.5 ${details.pompaGlow ? "text-blue-600 dark:text-blue-400" : "opacity-80"}`}>{details.aksiPompa}</span>
                </div>

                {/* Panel Lampu UV */}
                <div className={`p-2 rounded-lg border flex flex-col items-center justify-center text-center transition-all duration-500 ${details.lampuGlow ? "bg-purple-500/10 dark:bg-purple-900/20 border-purple-400/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]" : "bg-white/20 dark:bg-slate-800/30 border-white/20 dark:border-slate-700/50"}`}>
                  <Zap className={`w-5 h-5 mb-1 transition-colors ${details.lampuGlow ? "text-purple-500 animate-pulse" : "opacity-50"}`} />
                  <span className="text-[9px] font-medium uppercase tracking-wider opacity-70">Lampu UV</span>
                  <span className={`text-xs font-bold mt-0.5 ${details.lampuGlow ? "text-purple-600 dark:text-purple-400" : "opacity-80"}`}>{details.aksiLampu}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
