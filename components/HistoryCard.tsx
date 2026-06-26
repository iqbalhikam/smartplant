import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, TrendingUp, History } from "lucide-react";
import Link from "next/link";
import { useMQTTContext } from "./MQTTProvider";
import { WidgetVariant } from "@/types";
import { BaseWidgetProps } from "../types";

const SensorChart = dynamic(() => import("./HistoryCharts").then(mod => mod.SensorChart), { 
  ssr: false, 
  loading: () => <div className="h-full w-full flex justify-center items-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div> 
});

interface SensorLog {
  id: string;
  suhu: number;
  tanah: number;
  createdAt: string;
}

interface HistoryCardProps extends BaseWidgetProps {
  variant?: WidgetVariant;
}

export default function HistoryCard({ variant = "default" }: HistoryCardProps) {
  const { config } = useMQTTContext();
  const [sensorLogs, setSensorLogs] = useState<SensorLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!config.deviceId) return;
    
    const fetchRecentLogs = async () => {
      try {
        const res = await fetch(`/api/logs/sensor?deviceId=${config.deviceId}&limit=20`);
        const data = await res.json();
        if (data.success) {
          setSensorLogs(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch recent logs:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentLogs();
  }, [config.deviceId]);

  const chartData = React.useMemo(() => {
    return [...sensorLogs].reverse().map(log => ({
      ...log,
      time: new Date(log.createdAt).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })
    }));
  }, [sensorLogs]);

  const renderContent = (chartContent: React.ReactNode) => {
    if (variant === "minimal") {
      return (
        <div className="bg-transparent border-l-4 border-primary pl-4 py-2 flex flex-col h-full pointer-events-auto">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Tren Lingkungan</h2>
            <Link href="/history" className="ml-auto" title="History"><History className="w-4 h-4 text-slate-400 hover:text-primary" /></Link>
          </div>
          <div className="flex-1 min-h-[150px] w-full mt-2">
            {chartContent}
          </div>
        </div>
      );
    }

    if (variant === "glassmorphism") {
      return (
        <div className="bg-surface backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] h-full flex flex-col relative overflow-hidden pointer-events-auto">
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full bg-primary/20 blur-2xl"></div>
          <div className="flex items-center justify-between z-10 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border border-white/30 bg-linear-to-br from-secondary/30 to-secondary/10 shadow-[0_0_20px_rgba(20,184,166,0.2)]">
                <TrendingUp className="w-5 h-5 text-primary dark:text-secondary" />
              </div>
              <h2 className="text-sm font-bold tracking-wide text-slate-700 dark:text-slate-200">TREN LINGKUNGAN</h2>
            </div>
            <Link href="/history" className="p-2 rounded-full bg-white/20 hover:bg-white/40 dark:bg-slate-800/40 transition-colors"><History className="w-4 h-4 text-slate-600 dark:text-slate-300" /></Link>
          </div>
          <div className="flex-1 min-h-[150px] w-full z-10">
            {chartContent}
          </div>
        </div>
      );
    }

    if (variant === "solid") {
      return (
        <div className="bg-linear-to-br from-secondary to-primary rounded-2xl p-5 shadow-xl shadow-primary/30 h-full flex flex-col relative overflow-hidden pointer-events-auto">
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
          <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-3 z-10">
            <div className="flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5" />
              <h2 className="text-sm font-bold uppercase tracking-wider drop-shadow-sm">TREN LINGKUNGAN</h2>
            </div>
            <Link href="/history" className="text-white/80 hover:text-white"><History className="w-4 h-4" /></Link>
          </div>
          <div className="flex-1 min-h-[150px] w-full z-10 bg-white/10 rounded-xl p-2 backdrop-blur-sm">
            {chartContent}
          </div>
        </div>
      );
    }

    if (variant === "neon") {
      return (
        <div className="bg-background border border-primary/50 rounded-xl p-5 flex flex-col h-full relative overflow-hidden shadow-[0_0_15px_rgba(20,184,166,0.3),inset_0_0_20px_rgba(20,184,166,0.1)] pointer-events-auto">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-secondary to-transparent opacity-70"></div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary drop-shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
              <h3 className="font-mono text-secondary uppercase tracking-[0.2em] text-xs drop-shadow-[0_0_2px_rgba(20,184,166,0.5)]">SYS_TREND</h3>
            </div>
            <Link href="/history"><History className="w-4 h-4 text-primary/70 hover:text-secondary" /></Link>
          </div>
          <div className="flex-1 min-h-[150px] w-full relative z-10 border border-primary/30 rounded-lg p-2 bg-teal-950/30">
            {chartContent}
          </div>
        </div>
      );
    }

    if (variant === "neobrutalism") {
      return (
        <div className="border-4 border-black rounded-xl p-5 flex flex-col h-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-[#fde047] pointer-events-auto">
          <div className="flex justify-between items-center mb-4 border-b-4 border-black pb-4">
             <div className="flex items-center gap-2">
               <div className="bg-white border-2 border-black p-1 rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                 <TrendingUp className="w-5 h-5 text-black" fill="none" strokeWidth={3} />
               </div>
               <h3 className="font-black text-black uppercase tracking-widest text-sm">TREN</h3>
             </div>
             <Link href="/history" className="bg-white border-2 border-black p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><History className="w-4 h-4 text-black" /></Link>
          </div>
          <div className="flex-1 min-h-[150px] w-full bg-white border-4 border-black shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.1)] rounded-lg p-2">
            {chartContent}
          </div>
        </div>
      );
    }

    if (variant === "neumorphism") {
      return (
        <div className="bg-[#e0e5ec] dark:bg-slate-800 rounded-3xl p-6 flex flex-col h-full shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(255,255,255,0.05)] border-none pointer-events-auto">
          <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#e0e5ec] dark:bg-slate-800 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] text-primary">
                 <TrendingUp className="w-4 h-4" />
               </div>
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tren Data</span>
             </div>
             <Link href="/history" className="w-8 h-8 rounded-full flex items-center justify-center bg-[#e0e5ec] dark:bg-slate-800 shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.5)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)]">
               <History className="w-3 h-3 text-slate-500" />
             </Link>
          </div>
          <div className="flex-1 min-h-[150px] w-full rounded-2xl bg-[#e0e5ec] dark:bg-slate-800 shadow-[inset_6px_6px_12px_rgba(163,177,198,0.6),inset_-6px_-6px_12px_rgba(255,255,255,0.5)] dark:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.4),inset_-6px_-6px_12px_rgba(255,255,255,0.05)] border-4 border-[#e0e5ec] dark:border-slate-800 p-2">
            {chartContent}
          </div>
        </div>
      );
    }

    // Default UI
    return (
      <div className="flex flex-col h-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden p-4 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300 pointer-events-auto">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/50 pb-2 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg border border-primary/20 shadow-inner">
              <TrendingUp className="w-4 h-4 text-primary dark:text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm tracking-wide">Tren Lingkungan</h3>
              <p className="text-[10px] opacity-70">20 Data Terakhir</p>
            </div>
          </div>
          <Link href="/history" className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Buka Halaman Riwayat Lengkap">
            <History className="w-4 h-4 text-slate-500" />
          </Link>
        </div>

        <div className="flex-1 min-h-[150px] w-full">
          {chartContent}
        </div>
      </div>
    );
  };

  const chartElement = isLoading ? (
    <div className="h-full w-full flex justify-center items-center">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  ) : sensorLogs.length === 0 ? (
    <div className="h-full w-full flex justify-center items-center text-xs text-slate-500">
      Belum ada data
    </div>
  ) : (
    <div className="h-full w-full">
      <SensorChart data={chartData} />
    </div>
  );

  return renderContent(chartElement);
}
