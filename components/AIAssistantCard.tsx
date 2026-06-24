import React, { useState } from "react";
import { Brain, AlertTriangle, Loader2, Sparkles, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { SmartPlantData } from "../types";
import { useDeviceStore } from "../store/useDeviceStore";

interface AIAssistantCardProps {
  telemetry: SmartPlantData;
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
};

export default function AIAssistantCard({ telemetry }: AIAssistantCardProps) {
  const { activeDeviceId } = useDeviceStore();
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
      const payload = {
        ...telemetry,
        deviceId: activeDeviceId
      };

      const response = await fetch("/api/analyze-plant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
      className="flex flex-col h-full min-h-0 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden p-3"
    >
      <div className="flex items-center justify-between border-b border-white/50 dark:border-white/10 pb-2 mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
            <Brain className="w-4 h-4 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 tracking-wide text-xs">Asisten AI Botanist</h3>
            <p className="text-[9px] text-slate-500 dark:text-slate-400">Analisis oleh Google Gemini</p>
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setAiEnabled(!aiEnabled);
              if (aiResult) setAiResult("");
              if (aiError) setAiError(null);
            }}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${aiEnabled ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-800"
              }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${aiEnabled ? "translate-x-4" : "translate-x-0"
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
            className="flex flex-col min-h-0 overflow-y-auto"
          >
            <div className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
              Aktifkan asisten pintar untuk menganalisis data sensor IoT secara otomatis.
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-2">
              <button
                onClick={handleAnalyzePlant}
                disabled={aiLoading || !telemetry}
                className="w-full py-2 bg-linear-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white disabled:opacity-50 rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Menganalisis...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    Analisis Kondisi Sekarang
                  </>
                )}
              </button>
            </div>

            {/* AI Response Display */}
            <AnimatePresence>
              {aiLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="p-2 bg-slate-50/50 dark:bg-slate-950/40 border border-white/50 dark:border-white/10 rounded-lg flex items-center gap-2"
                >
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-[9px] text-indigo-500 dark:text-indigo-300/80 font-medium">Asisten sedang membaca rekam medis...</span>
                </motion.div>
              )}

              {aiError && !aiLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-2 bg-rose-500/10 border border-rose-500/25 rounded-lg flex items-start gap-2 text-[10px] text-rose-600 dark:text-rose-300"
                >
                  <AlertTriangle className="w-3 h-3 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Gagal Menganalisis</p>
                    <p className="opacity-90">{aiError}</p>
                  </div>
                </motion.div>
              )}

              {aiResult && !aiLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-500/20 rounded-lg overflow-y-auto text-xs"
                >
                  <div className="flex gap-2 relative z-10">
                    <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg h-fit">
                      <Bot className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">Rekomendasi Ahli Botani AI</div>
                      <blockquote className="text-[10px] text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
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
