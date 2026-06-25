import React, { useState } from "react";
import { Brain, AlertTriangle, Loader2, Sparkles, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");

  const handleAnalyzePlant = async () => {
    if (!telemetry) return;
    setAiLoading(true);
    setAiError(null);
    setAiResult("");

    try {
      const payload = {
        ...telemetry,
        deviceId: activeDeviceId,
        aiModel: selectedModel,
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

            <div className="bg-slate-100/80 dark:bg-slate-900/50 p-1 rounded-xl mb-3 flex items-center justify-between gap-1 shadow-inner border border-slate-200/50 dark:border-slate-800/50">
              {[
                { id: "gemini-2.5-flash", label: "2.5 Flash", desc: "Cepat" },
                { id: "gemini-2.5-pro", label: "2.5 Pro", desc: "Akurat" },
                { id: "gemini-3.1-flash-lite", label: "3.1 Lite", desc: "Ringan" },
              ].map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[9px] transition-all duration-300 relative overflow-hidden ${
                    selectedModel === model.id
                      ? "text-indigo-600 dark:text-indigo-400 font-bold shadow-sm bg-white dark:bg-slate-800 border border-white/60 dark:border-white/10"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 border border-transparent"
                  }`}
                >
                  <span className="relative z-10 tracking-wide">{model.label}</span>
                  <span className={`text-[8px] relative z-10 transition-opacity ${selectedModel === model.id ? "opacity-100 font-medium" : "opacity-60 font-normal"}`}>
                    {model.desc}
                  </span>
                </button>
              ))}
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
                  className="p-3 bg-linear-to-r from-slate-50 to-indigo-50/30 dark:from-slate-900/50 dark:to-indigo-900/20 border border-indigo-100 dark:border-indigo-500/20 rounded-xl flex flex-col items-center justify-center gap-3 py-6"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
                    <div className="relative flex gap-1.5 bg-white dark:bg-slate-800 p-2 rounded-full border border-indigo-100 dark:border-indigo-500/30 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium tracking-wide animate-pulse">
                    Menyusun laporan ahli botani...
                  </span>
                </motion.div>
              )}

              {aiError && !aiLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-rose-50/50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 rounded-xl flex items-start gap-2 text-[10px] text-rose-600 dark:text-rose-300"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-rose-700 dark:text-rose-200 mb-0.5">Gagal Menganalisis</p>
                    <p className="opacity-90 leading-relaxed">{aiError}</p>
                  </div>
                </motion.div>
              )}

              {aiResult && !aiLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  className="p-3.5 bg-linear-to-br from-indigo-50/90 to-purple-50/90 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200/60 dark:border-indigo-500/30 rounded-xl shadow-[inset_0_1px_3px_rgba(255,255,255,0.5)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] overflow-y-auto max-h-[350px] text-xs custom-scrollbar relative"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
                  
                  <div className="flex gap-3 relative z-10">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm shadow-indigo-500/20 rounded-lg h-fit shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="space-y-2 flex-1 w-full min-w-0">
                      <div className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 tracking-wider uppercase flex items-center gap-1.5 border-b border-indigo-200/60 dark:border-indigo-500/20 pb-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Analisis & Rekomendasi AI
                      </div>
                      <div className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            strong: ({node, ...props}) => <strong className="font-bold text-indigo-900 dark:text-indigo-300" {...props} />,
                            p: ({node, ...props}) => <p className="mb-2.5 last:mb-0" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2.5 space-y-1.5 text-slate-600 dark:text-slate-400 marker:text-indigo-400" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2.5 space-y-1.5 text-slate-600 dark:text-slate-400 marker:text-indigo-400" {...props} />,
                            li: ({node, ...props}) => <li className="pl-1" {...props} />,
                            h3: ({node, ...props}) => <h3 className="font-bold text-indigo-800 dark:text-indigo-300 text-xs mt-3 mb-1.5 flex items-center gap-1" {...props} />
                          }}
                        >
                          {aiResult}
                        </ReactMarkdown>
                      </div>
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
