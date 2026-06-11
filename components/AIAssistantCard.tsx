import React, { useState } from "react";
import { Brain, AlertTriangle, Loader2, Sparkles, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { SmartPlantData } from "../types";

interface AIAssistantCardProps {
  telemetry: SmartPlantData;
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
};

export default function AIAssistantCard({ telemetry }: AIAssistantCardProps) {
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAnalyzePlant = async () => {
    if (!telemetry) return;
    setAiLoading(true);
    setAiError(null);
    setAiResult("");

    try {
      const response = await fetch("/api/analyze-plant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(telemetry),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Gagal melakukan analisis kondisi tanaman.");
      }

      setAiResult(data.analysis);
      toast.success("Analisis AI Berhasil", {
        description: "Rekomendasi ahli botani telah diperbarui.",
      });
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Terjadi kesalahan koneksi.");
      toast.error("Gagal melakukan analisis AI", {
        description: err.message || "Terjadi kesalahan koneksi.",
      });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300 overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <Brain className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 tracking-wide text-sm">Asisten AI Botanist</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Analisis kondisi tanaman secara pintar oleh Google Gemini</p>
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            {aiEnabled ? "Aktif" : "Nonaktif"}
          </span>
          <button
            onClick={() => {
              setAiEnabled(!aiEnabled);
              if (aiResult) setAiResult("");
              if (aiError) setAiError(null);
            }}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${aiEnabled ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-800"
              }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${aiEnabled ? "translate-x-5" : "translate-x-0"
                }`}
            />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {aiEnabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 overflow-hidden"
          >
            <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Aktifkan asisten pintar untuk menganalisis data sensor IoT Anda (kelembapan tanah, status cahaya, pompa air, dan lampu UV) secara otomatis menggunakan AI model canggih dari Google Gemini.
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleAnalyzePlant}
                disabled={aiLoading || !telemetry}
                className="px-5 py-2.5 bg-linear-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white disabled:opacity-50 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 flex items-center gap-2 active:scale-95 cursor-pointer shadow-lg shadow-indigo-500/10"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menganalisis...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analisis Kondisi Sekarang
                  </>
                )}
              </button>
            </div>

            {/* AI Response Display */}
            <AnimatePresence>
              {aiLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 rounded-xl flex items-center gap-3"
                >
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-xs text-indigo-300/80 font-medium">Asisten sedang membaca rekam medis botani tanaman Anda...</span>
                </motion.div>
              )}

              {aiError && !aiLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-xl flex items-start gap-2.5 text-xs text-rose-300"
                >
                  <AlertTriangle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-rose-200">Gagal Menganalisis</p>
                    <p className="opacity-90">{aiError}</p>
                  </div>
                </motion.div>
              )}

              {aiResult && !aiLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  className="p-4 bg-linear-to-r from-indigo-50 dark:from-indigo-950/20 to-purple-50 dark:to-purple-950/20 border border-indigo-200 dark:border-indigo-500/20 rounded-xl relative overflow-hidden"
                >
                  <div className="absolute -right-12 -bottom-12 w-28 h-28 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />

                  <div className="flex gap-3 relative z-10">
                    <div className="p-2 bg-indigo-500/15 border border-indigo-500/20 rounded-xl h-fit">
                      <Bot className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">Rekomendasi Ahli Botani AI</div>
                      <blockquote className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        "{aiResult}"
                      </blockquote>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
