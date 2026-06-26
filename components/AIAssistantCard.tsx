import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Brain, AlertTriangle, Loader2, Sparkles, Bot, Maximize2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SmartPlantData, WidgetVariant } from "../types";
import { useDeviceStore } from "../store/useDeviceStore";

interface AIAssistantCardProps {
  telemetry: SmartPlantData;
  variant?: WidgetVariant;
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
};

export default function AIAssistantCard({ telemetry, variant = "default" }: AIAssistantCardProps) {
  const { activeDeviceId } = useDeviceStore();
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const assistantContent = (
      <>
        {/* Toggle Switch area remains the same inner structure */}
        <div className="flex items-center justify-between border-b border-white/50 dark:border-slate-700/50 pb-2 mb-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 border border-primary/20 rounded-lg">
              <Brain className="w-4 h-4 text-primary dark:text-secondary animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary tracking-wide text-xs">Asisten AI Botanist</h3>
              <p className="text-[9px] text-text-secondary">Analisis oleh Google Gemini</p>
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
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${aiEnabled ? "bg-primary" : "bg-slate-300 dark:bg-slate-800"
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
              <div className="text-[10px] text-text-secondary leading-relaxed mb-2">
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
                        ? "text-primary dark:text-secondary font-bold shadow-sm bg-white dark:bg-slate-800 border border-white/60 dark:border-white/10"
                        : "text-text-secondary hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 border border-transparent"
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
                  className="w-full py-2 bg-linear-to-br from-secondary to-primary hover:from-primary hover:to-primary text-white disabled:opacity-50 rounded-lg text-[10px] font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
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
                    className="p-3 bg-linear-to-br from-secondary to-primary/30 dark:from-slate-900/50 dark:to-indigo-900/20 border border-indigo-100 dark:border-primary/20 rounded-xl flex flex-col items-center justify-center gap-3 py-6"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary blur-xl opacity-20 animate-pulse rounded-full"></div>
                      <div className="relative flex gap-1.5 bg-white dark:bg-slate-800 p-2 rounded-full border border-indigo-100 dark:border-primary/30 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                    <span className="text-[10px] text-primary dark:text-secondary font-medium tracking-wide animate-pulse">
                      Menyusun laporan ahli botani...
                    </span>
                  </motion.div>
                )}

                {aiError && !aiLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-rose-50/50 dark:bg-danger/10 border border-rose-200 dark:border-danger/25 rounded-xl flex items-start gap-2 text-[10px] text-rose-600 dark:text-rose-300"
                  >
                    <AlertTriangle className="w-4 h-4 text-danger dark:text-rose-400 shrink-0 mt-0.5" />
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
                    className="p-3.5 bg-linear-to-br from-indigo-50/90 to-purple-50/90 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200/60 dark:border-primary/30 rounded-xl shadow-[inset_0_1px_3px_rgba(255,255,255,0.5)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] overflow-y-auto max-h-[350px] text-xs custom-scrollbar relative"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 dark:bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
                    
                    <div className="flex gap-3 relative z-10">
                      <div className="p-2 bg-linear-to-br from-secondary to-primary shadow-sm shadow-primary/20 rounded-lg h-fit shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="space-y-2 flex-1 w-full min-w-0">
                        <div className="text-[10px] font-bold text-primary dark:text-secondary tracking-wider uppercase flex items-center gap-1.5 border-b border-indigo-200/60 dark:border-primary/20 pb-2">
                          <Sparkles className="w-3.5 h-3.5 text-warning" />
                          Analisis & Rekomendasi AI
                          <button
                            onClick={() => setIsExpanded(true)}
                            className="ml-auto p-1 hover:bg-indigo-100 dark:hover:bg-primary/20 rounded-md transition-colors cursor-pointer"
                            title="Perbesar"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[11px] text-text-primary leading-relaxed pt-1">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              strong: ({node, ...props}) => <strong className="font-bold text-indigo-900 dark:text-secondary" {...props} />,
                              p: ({node, ...props}) => <p className="mb-2.5 last:mb-0" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2.5 space-y-1.5 text-text-secondary marker:text-secondary" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2.5 space-y-1.5 text-text-secondary marker:text-secondary" {...props} />,
                              li: ({node, ...props}) => <li className="pl-1" {...props} />,
                              h3: ({node, ...props}) => <h3 className="font-bold text-indigo-800 dark:text-secondary text-xs mt-3 mb-1.5 flex items-center gap-1" {...props} />
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
      </>
    );

  const renderContent = () => {
    if (variant === "minimal") {
      return (
        <div className="bg-transparent border-l-4 border-primary pl-4 py-2 flex flex-col h-full pointer-events-auto relative">
          <div className="flex items-center gap-2 mb-3 opacity-80">
            <Bot className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Botanist AI</h2>
          </div>
          {assistantContent}
        </div>
      );
    }

    if (variant === "glassmorphism") {
      return (
        <div className="bg-surface backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] h-full flex flex-col relative overflow-hidden pointer-events-auto">
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full bg-primary/20 blur-2xl"></div>
          <div className="flex items-center gap-3 mb-3 z-10">
            <div className="w-10 h-10 rounded-full flex items-center justify-center border border-white/30 bg-linear-to-br from-secondary/30 to-secondary/10 shadow-[0_0_20px_rgba(99,102,241,0.2)] shrink-0">
              <Bot className="w-5 h-5 text-primary dark:text-secondary" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide text-slate-700 dark:text-slate-200">AI BOTANIST</h2>
              <p className="text-[9px] opacity-70">Analisis Pakar</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col relative z-10">
            {assistantContent}
          </div>
        </div>
      );
    }

    if (variant === "solid") {
      return (
        <div className="bg-linear-to-br from-secondary to-primary rounded-2xl p-4 shadow-xl shadow-primary/30 h-full flex flex-col relative overflow-hidden pointer-events-auto">
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
          <div className="flex items-center gap-2 border-b border-white/20 pb-2 mb-3 z-10 text-white">
            <Bot className="w-5 h-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider drop-shadow-sm">AI Botanist</h2>
          </div>
          <div className="flex-1 flex flex-col bg-surface rounded-xl p-3 shadow-inner relative z-10">
            {assistantContent}
          </div>
        </div>
      );
    }

    if (variant === "neon") {
      return (
        <div className="bg-background border border-primary/50 rounded-xl p-4 flex flex-col h-full relative overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.3),inset_0_0_20px_rgba(99,102,241,0.1)] pointer-events-auto">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-secondary to-transparent opacity-70"></div>
          <div className="flex items-center gap-2 mb-4">
            <Bot className="w-5 h-5 text-secondary drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            <h3 className="font-mono text-secondary uppercase tracking-[0.2em] text-xs drop-shadow-[0_0_2px_rgba(99,102,241,0.5)]">SYS_AI_BOTANIST</h3>
          </div>
          <div className="flex-1 flex flex-col relative z-10 border border-primary/30 rounded-lg p-2 bg-indigo-950/30">
            {assistantContent}
          </div>
        </div>
      );
    }

    if (variant === "neobrutalism") {
      return (
        <div className="border-4 border-black rounded-xl p-4 flex flex-col h-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-[#ffeb3b] pointer-events-auto">
          <div className="flex items-center gap-2 mb-3 border-b-4 border-black pb-3">
             <div className="bg-white border-2 border-black p-1 rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
               <Bot className="w-4 h-4 text-black" />
             </div>
             <h3 className="font-black text-black uppercase tracking-widest text-sm">AI BOTANIST</h3>
          </div>
          <div className="flex-1 flex flex-col bg-white border-4 border-black shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.1)] rounded-lg p-2 relative">
            {assistantContent}
          </div>
        </div>
      );
    }

    if (variant === "neumorphism") {
      return (
        <div className="bg-[#e0e5ec] dark:bg-slate-800 rounded-3xl p-5 flex flex-col h-full shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(255,255,255,0.05)] border-none pointer-events-auto">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#e0e5ec] dark:bg-slate-800 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] text-primary shrink-0">
               <Bot className="w-4 h-4" />
             </div>
             <div>
               <h3 className="font-bold text-slate-600 dark:text-slate-300 tracking-widest text-xs uppercase">AI Botanist</h3>
             </div>
          </div>
          <div className="flex-1 flex flex-col rounded-2xl bg-[#e0e5ec] dark:bg-slate-800 shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,0.5)] dark:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.4),inset_-6px_-6px_12px_rgba(255,255,255,0.05)] border-4 border-[#e0e5ec] dark:border-slate-800 p-3 relative">
            {assistantContent}
          </div>
        </div>
      );
    }

    // Default UI
    return (
      <div className="flex flex-col h-full min-h-0 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden p-3 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300 pointer-events-auto">
        {assistantContent}
      </div>
    );
  };

  return (
    <>
    <motion.div variants={itemVariants} className="h-full">
      {renderContent()}
    </motion.div>

    {isMounted && createPortal(
      <AnimatePresence>
        {isExpanded && aiResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setIsExpanded(false)}
          >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-surface border border-border rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2 font-bold text-primary dark:text-secondary">
                <Sparkles className="w-5 h-5 text-warning" />
                Analisis & Rekomendasi AI
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar text-sm text-text-primary">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  strong: ({node, ...props}) => <strong className="font-bold text-indigo-900 dark:text-secondary" {...props} />,
                  p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-2 text-text-secondary marker:text-secondary" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-2 text-text-secondary marker:text-secondary" {...props} />,
                  li: ({node, ...props}) => <li className="pl-1" {...props} />,
                  h3: ({node, ...props}) => <h3 className="font-bold text-indigo-800 dark:text-secondary text-sm mt-4 mb-2 flex items-center gap-1.5" {...props} />
                }}
              >
                {aiResult}
              </ReactMarkdown>
            </div>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </>
  );
}
