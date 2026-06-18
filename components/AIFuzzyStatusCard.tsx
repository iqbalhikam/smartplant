import React from "react";
import { BrainCircuit, Sun, PowerOff, Droplets, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SmartPlantData } from "../types";

interface AIFuzzyStatusCardProps {
  telemetry: SmartPlantData | null;
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
};

export default function AIFuzzyStatusCard({ telemetry }: AIFuzzyStatusCardProps) {
  const rule = telemetry?.rule || "IDLE";

  let statusConfig = {
    title: "Menganalisis Lingkungan",
    desc: "Kondisi seimbang. Sistem terus memantau data sensor secara real-time.",
    icon: <BrainCircuit className="w-5 h-5 text-slate-500 animate-pulse" />,
    color: "text-slate-600 dark:text-slate-300",
    bg: "bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700",
  };

  if (telemetry?.mode === "MANUAL") {
    statusConfig = {
      title: "Fuzzy Logic Nonaktif",
      desc: "Sistem berjalan dalam mode kendali manual penuh.",
      icon: <PowerOff className="w-5 h-5 text-slate-400" />,
      color: "text-slate-500 dark:text-slate-400",
      bg: "bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800",
    };
  } else if (rule === "COOLDOWN") {
    statusConfig = {
      title: "Jeda Penyiraman Aktif (Cooldown)",
      desc: "Pompa dimatikan sementara agar air dapat meresap ke tanah dengan optimal sebelum analisis berikutnya.",
      icon: <BrainCircuit className="w-5 h-5 text-amber-500 animate-pulse" />,
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    };
  } else if (["R1", "R2", "R4", "R5", "R6", "R7", "R8", "R10", "R11", "R_DEF_SK", "R_DEF_K"].includes(rule)) {
    statusConfig = {
      title: "AI Mendeteksi Kekeringan",
      desc: "Tanah mulai kering. Memulai penyiraman terukur sesuai kondisi cuaca.",
      icon: <Droplets className="w-5 h-5 text-blue-500" />,
      color: "text-blue-500 dark:text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    };
  } else if (["R3", "R9"].includes(rule)) {
    statusConfig = {
      title: "Penyiraman & Fotosintesis Aktif",
      desc: "Tanah kering dan cahaya minim. AI menyalakan pompa air sekaligus lampu UV untuk pertumbuhan.",
      icon: (
        <div className="flex gap-1">
          <Droplets className="w-5 h-5 text-blue-500" />
          <Sun className="w-5 h-5 text-purple-500" />
        </div>
      ),
      color: "text-indigo-500 dark:text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20",
    };
  } else if (["R14", "R17"].includes(rule)) {
    statusConfig = {
      title: "Sistem Fotosintesis Aktif",
      desc: "Kelembapan cukup, namun cahaya sekitar minim. Menyalakan lampu UV untuk membantu pertumbuhan.",
      icon: <Sun className="w-5 h-5 text-purple-500" />,
      color: "text-purple-500 dark:text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
    };
  } else if (["R_STOP", "R15", "R16", "R18", "R19", "R20", "R16/19", "R18/20", "R_DEF_L"].includes(rule)) {
    statusConfig = {
      title: "Kondisi Tanah Optimal",
      desc: "Kelembapan tanah mencukupi. Pompa ditahan oleh AI untuk mencegah akar busuk.",
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    };
  }

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300"
    >
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800/60 pb-3 mb-4">
        <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
          <BrainCircuit className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 tracking-wide text-sm">Fuzzy Logic AI</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Penerjemah Keputusan Sistem (Rule: {rule})</p>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={statusConfig.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`p-4 rounded-xl border ${statusConfig.bg} flex items-start gap-3`}
          >
            <div className="shrink-0 mt-0.5">
              {statusConfig.icon}
            </div>
            <div>
              <h4 className={`font-bold text-sm ${statusConfig.color} mb-1`}>{statusConfig.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {statusConfig.desc}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
