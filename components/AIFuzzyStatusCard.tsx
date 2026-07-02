import React, { useState, useEffect, useRef } from "react";
import { BrainCircuit, Sun, PowerOff, Droplets, Zap, Timer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SmartPlantData, WidgetVariant } from "../types";

interface AIFuzzyStatusCardProps {
  telemetry: SmartPlantData | null;
  variant?: WidgetVariant;
}

// 1. Dictionary / Mapping Rules
const getFuzzyRuleDetails = (rule: string) => {
  if (rule === "IDLE") return { kondisi: "Memantau Lingkungan", aksiPompa: "Mati (Standby)", aksiLampu: "Mati", warna: "text-slate-400", pompaGlow: false, lampuGlow: false };
  if (rule === "COOLDOWN") return { kondisi: "Fase Istirahat", aksiPompa: "Mati (Jeda)", aksiLampu: "Mati", warna: "text-warning", pompaGlow: false, lampuGlow: false };
  if (rule === "R_DEF_SK") return { kondisi: "Sangat Kering (Default) - Siram Sedang", aksiPompa: "Menyiram Sedang", aksiLampu: "Auto", warna: "text-danger", pompaGlow: true, lampuGlow: false };
  if (rule === "R_DEF_K") return { kondisi: "Kering (Default) - Siram Sedikit", aksiPompa: "Menyiram Sedikit", aksiLampu: "Auto", warna: "text-primary", pompaGlow: true, lampuGlow: false };
  if (rule === "R_DEF_L") return { kondisi: "Lembap (Default) - Stop Penyiraman", aksiPompa: "Mati (Stop)", aksiLampu: "Auto", warna: "text-primary", pompaGlow: false, lampuGlow: false };

  // Stop conditions
  if (rule.includes("R_STOP") || /^R(1[2-9]|20)$/.test(rule)) {
    return { kondisi: "Tanah Basah / Cuaca Tidak Mendukung - Pompa Siaga (Stop)", aksiPompa: "Mati (Stop)", aksiLampu: "Auto", warna: "text-primary", pompaGlow: false, lampuGlow: false };
  }

  // Handle new suffixes for 4D Fuzzy
  if (rule.includes("-A")) {
    return { kondisi: "(Udara Kering) -> Tingkatkan Air", aksiPompa: "Menyiram Ekstra", aksiLampu: "Auto", warna: "text-danger", pompaGlow: true, lampuGlow: false };
  }
  if (rule.includes("-B")) {
    return { kondisi: "(Udara Normal) -> Air Standar", aksiPompa: "Menyiram Normal", aksiLampu: "Auto", warna: "text-primary", pompaGlow: true, lampuGlow: false };
  }
  if (rule.includes("-C")) {
    return { kondisi: "(Udara Lembap) -> Kurangi Air", aksiPompa: "Menyiram Sedikit", aksiLampu: "Auto", warna: "text-primary", pompaGlow: true, lampuGlow: false };
  }

  // Fallback for any other watering rule
  if (/^R[1-9]$|^R1[0-1]$/.test(rule)) {
    return { kondisi: "Mendeteksi Kekeringan", aksiPompa: "Menyiram", aksiLampu: "Auto", warna: "text-primary", pompaGlow: true, lampuGlow: false };
  }

  return { kondisi: "Menganalisis data...", aksiPompa: "Mati", aksiLampu: "Mati", warna: "text-slate-500", pompaGlow: false, lampuGlow: false };
};

// 2. Helper categories for Section A (Fuzzifikasi)
const getTanahStatus = (val: number, basah: number, kering: number) => {
  const range = kering - basah;
  const percentage = range !== 0 ? (val - basah) / range : 0;
  
  if (percentage > 0.8) return { label: "SANGAT KERING", className: "bg-danger/10 text-rose-600 dark:text-rose-400 border-danger/20" };
  if (percentage > 0.5) return { label: "KERING", className: "bg-primary/10 text-primary dark:text-secondary border-primary/20" };
  if (percentage > 0.2) return { label: "LEMBAP", className: "bg-primary/10 text-primary dark:text-secondary border-primary/20" };
  return { label: "BASAH", className: "bg-primary/10 text-primary dark:text-secondary border-primary/20" };
};

const getSuhuStatus = (suhu: number | undefined) => {
  if (suhu === undefined || suhu === -1) return { label: "TIDAK AKTIF", className: "bg-slate-500/10 text-slate-500 border-slate-500/20" };
  if (suhu < 25) return { label: "DINGIN", className: "bg-primary/10 text-primary dark:text-secondary border-primary/20" };
  if (suhu <= 30) return { label: "NORMAL", className: "bg-primary/10 text-primary dark:text-secondary border-primary/20" };
  if (suhu <= 35) return { label: "PANAS", className: "bg-primary/10 text-primary dark:text-secondary border-primary/20" };
  return { label: "SANGAT PANAS", className: "bg-danger/10 text-rose-600 dark:text-rose-400 border-danger/20" };
};

const getCahayaStatus = (cahaya: number) => {
  if (cahaya === 0) return { label: "TERIK", className: "bg-warning/10 text-amber-600 dark:text-amber-400 border-warning/20" };
  return { label: "GELAP", className: "bg-primary/10 text-primary dark:text-secondary border-primary/20" };
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
};

export default function AIFuzzyStatusCard({ telemetry, variant = "default" }: AIFuzzyStatusCardProps) {
  const isManual = telemetry?.mode === "MANUAL";
  const rule = telemetry?.rule || "IDLE";
  
  const [timeLeft, setTimeLeft] = useState(0);
  const prevPompaRef = useRef(telemetry?.pompa);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (telemetry?.pompa === 1 && prevPompaRef.current !== 1) {
      const duration = telemetry.durasiPompa || telemetry.baseDurasi || 0;
      setTimeLeft(Math.ceil(duration / 1000));
    } else if (telemetry?.pompa === 0) {
      setTimeLeft(0);
    }

    if (telemetry?.pompa === 1) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    prevPompaRef.current = telemetry?.pompa;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [telemetry?.pompa, telemetry?.durasiPompa, telemetry?.baseDurasi]);

  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0);
  const prevRuleRef = useRef(telemetry?.rule);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (telemetry?.rule === "COOLDOWN" && prevRuleRef.current !== "COOLDOWN") {
      const cooldownSecs = telemetry?.cooldown ?? 60;
      setCooldownTimeLeft(cooldownSecs);
    } else if (telemetry?.rule !== "COOLDOWN") {
      setCooldownTimeLeft(0);
    }

    if (telemetry?.rule === "COOLDOWN") {
      interval = setInterval(() => {
        setCooldownTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    prevRuleRef.current = telemetry?.rule;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [telemetry?.rule, telemetry?.cooldown]);
  
  const details = getFuzzyRuleDetails(rule);
  
  const tanahStatus = getTanahStatus(telemetry?.tanah || 0, telemetry?.calBasah || 1500, telemetry?.calKering || 3500);
  const suhuStatus = getSuhuStatus(telemetry?.suhu);
  const cahayaStatus = getCahayaStatus(telemetry?.cahaya || 1);

  const fuzzyContent = (
    <>
      {/* Manual Mode Overlay */}
      <AnimatePresence>
        {isManual && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 backdrop-blur-md bg-surface flex flex-col items-center justify-center rounded-inherit"
          >
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-2 shadow-lg">
              <PowerOff className="w-6 h-6 text-slate-400" />
            </div>
            <h4 className="font-bold text-sm text-text-primary">Fuzzy Logic Nonaktif</h4>
            <p className="text-[10px] mt-1 px-4 text-center opacity-70 text-text-secondary">Mode manual aktif. Sistem otomatis diabaikan.</p>
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
            <div className="mb-2 p-2 bg-surface rounded-lg shadow-sm relative overflow-hidden shrink-0 border border-slate-200/50 dark:border-slate-700/50">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg"></div>
              <p className="text-[10px] opacity-70 mb-1 flex items-center gap-1 text-text-primary">
                Sistem Memutuskan <span className="px-1 py-0.5 bg-white dark:bg-slate-800 rounded font-mono font-bold text-primary dark:text-secondary">{rule}</span> :
              </p>
              <div className={`text-xs font-bold leading-snug flex items-center gap-1.5 ${details.warna}`}>
                "{details.kondisi}"
                {rule === "COOLDOWN" && cooldownTimeLeft > 0 && (
                  <span className="text-[10px] bg-warning/20 text-warning px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm border border-warning/30">
                    <Timer className="w-3 h-3 animate-pulse" />
                    {cooldownTimeLeft}s
                  </span>
                )}
              </div>
            </div>

            {/* Defuzzifikasi */}
            <div className="flex-1 flex flex-col min-h-0 mt-1">
              <p className="text-[9px] font-bold opacity-60 uppercase tracking-widest mb-1 text-text-secondary">Output Keputusan</p>
              <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
                {/* Panel Pompa */}
                <div className={`relative p-2 rounded-lg border flex flex-col items-center justify-center text-center transition-all duration-500 ${details.pompaGlow ? "bg-primary/10 dark:bg-blue-900/20 border-secondary/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]" : "bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50"}`}>
                  <Droplets className={`w-4 h-4 mb-1 transition-colors ${details.pompaGlow ? "text-primary animate-pulse" : "opacity-40 text-slate-500"}`} />
                  <span className="text-[8px] font-bold uppercase tracking-wider opacity-60 text-slate-600 dark:text-slate-300">Pompa Air</span>
                  <span className={`text-[10px] font-black mt-0.5 ${details.pompaGlow ? "text-primary dark:text-secondary" : "text-text-secondary opacity-80"}`}>{details.aksiPompa}</span>
                  
                  {telemetry?.pompa === 1 && timeLeft > 0 && (
                    <div className="absolute -top-2 -right-2 bg-primary text-white dark:bg-secondary dark:text-slate-900 text-[11px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md border-2 border-white dark:border-slate-800 z-10">
                      <Timer className="w-3 h-3 animate-pulse" />
                      {timeLeft}s
                    </div>
                  )}
                </div>

                {/* Panel Lampu UV */}
                <div className={`p-2 rounded-lg border flex flex-col items-center justify-center text-center transition-all duration-500 ${details.lampuGlow ? "bg-primary/10 dark:bg-purple-900/20 border-secondary/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]" : "bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50"}`}>
                  <Zap className={`w-4 h-4 mb-1 transition-colors ${details.lampuGlow ? "text-primary animate-pulse" : "opacity-40 text-slate-500"}`} />
                  <span className="text-[8px] font-bold uppercase tracking-wider opacity-60 text-slate-600 dark:text-slate-300">Lampu UV</span>
                  <span className={`text-[10px] font-black mt-0.5 ${details.lampuGlow ? "text-primary dark:text-secondary" : "text-text-secondary opacity-80"}`}>{details.aksiLampu}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );

  const renderContent = () => {
    if (variant === "minimal") {
      return (
        <div className="bg-transparent border-l-4 border-primary pl-4 py-2 flex flex-col h-full pointer-events-auto relative">
          <div className="flex items-center gap-2 mb-3 opacity-80">
            <BrainCircuit className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Fuzzy Logic Expert</h2>
          </div>
          {fuzzyContent}
        </div>
      );
    }

    if (variant === "glassmorphism") {
      return (
        <div className="bg-surface backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] h-full flex flex-col relative overflow-hidden pointer-events-auto">
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full bg-primary/20 blur-2xl"></div>
          <div className="flex items-center gap-3 mb-3 z-10">
            <div className="w-10 h-10 rounded-full flex items-center justify-center border border-white/30 bg-linear-to-br from-secondary/30 to-secondary/10 shadow-[0_0_20px_rgba(99,102,241,0.2)] shrink-0">
              <BrainCircuit className="w-5 h-5 text-primary dark:text-secondary" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide text-slate-700 dark:text-slate-200">FUZZY EXPERT</h2>
              <p className="text-[9px] opacity-70">Sistem Logika Cerdas</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col relative z-10">
            {fuzzyContent}
          </div>
        </div>
      );
    }

    if (variant === "solid") {
      return (
        <div className="bg-linear-to-br from-secondary to-primary rounded-2xl p-4 shadow-xl shadow-primary/30 h-full flex flex-col relative overflow-hidden pointer-events-auto">
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
          <div className="flex items-center gap-2 border-b border-white/20 pb-2 mb-3 z-10 text-white">
            <BrainCircuit className="w-5 h-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider drop-shadow-sm">Fuzzy Logic</h2>
          </div>
          <div className="flex-1 flex flex-col bg-surface rounded-xl p-3 shadow-inner relative z-10">
            {fuzzyContent}
          </div>
        </div>
      );
    }

    if (variant === "neon") {
      return (
        <div className="bg-background border border-primary/50 rounded-xl p-4 flex flex-col h-full relative overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.3),inset_0_0_20px_rgba(99,102,241,0.1)] pointer-events-auto">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-secondary to-transparent opacity-70"></div>
          <div className="flex items-center gap-2 mb-4">
            <BrainCircuit className="w-5 h-5 text-secondary drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            <h3 className="font-mono text-secondary uppercase tracking-[0.2em] text-xs drop-shadow-[0_0_2px_rgba(99,102,241,0.5)]">SYS_FUZZY_LOGIC</h3>
          </div>
          <div className="flex-1 flex flex-col relative z-10 border border-primary/30 rounded-lg p-2 bg-indigo-950/30">
            {fuzzyContent}
          </div>
        </div>
      );
    }

    if (variant === "neobrutalism") {
      return (
        <div className="border-4 border-black rounded-xl p-4 flex flex-col h-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-[#ff90e8] pointer-events-auto">
          <div className="flex items-center gap-2 mb-3 border-b-4 border-black pb-3">
             <div className="bg-white border-2 border-black p-1 rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
               <BrainCircuit className="w-4 h-4 text-black" />
             </div>
             <h3 className="font-black text-black uppercase tracking-widest text-sm">FUZZY LOGIC</h3>
          </div>
          <div className="flex-1 flex flex-col bg-white border-4 border-black shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.1)] rounded-lg p-2 relative">
            {fuzzyContent}
          </div>
        </div>
      );
    }

    if (variant === "neumorphism") {
      return (
        <div className="bg-[#e0e5ec] dark:bg-slate-800 rounded-3xl p-5 flex flex-col h-full shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(255,255,255,0.05)] border-none pointer-events-auto">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#e0e5ec] dark:bg-slate-800 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] text-primary shrink-0">
               <BrainCircuit className="w-4 h-4" />
             </div>
             <div>
               <h3 className="font-bold text-slate-600 dark:text-slate-300 tracking-widest text-xs uppercase">Fuzzy Logic</h3>
             </div>
          </div>
          <div className="flex-1 flex flex-col rounded-2xl bg-[#e0e5ec] dark:bg-slate-800 shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,0.5)] dark:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.4),inset_-6px_-6px_12px_rgba(255,255,255,0.05)] border-4 border-[#e0e5ec] dark:border-slate-800 p-3 relative">
            {fuzzyContent}
          </div>
        </div>
      );
    }

    // Default UI
    return (
      <div className="flex flex-col h-full min-h-0 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden p-4 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300 pointer-events-auto">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700/50 pb-2 mb-3 shrink-0">
          <div className="p-1.5 bg-primary/10 rounded-lg border border-primary/20 shadow-inner">
            <BrainCircuit className="w-4 h-4 text-primary dark:text-secondary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm tracking-wide">Fuzzy Logic Expert</h3>
            <p className="text-[10px] opacity-70">Keputusan Otomatis Berdasarkan Sensor</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col relative">
          {fuzzyContent}
        </div>
      </div>
    );
  };

  return renderContent();
}
