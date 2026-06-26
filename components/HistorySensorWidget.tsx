import React from 'react';
import { Loader2, Sun } from "lucide-react";
import dynamic from "next/dynamic";
import { WidgetVariant } from "../types";

const SensorChart = dynamic(() => import("./HistoryCharts").then(mod => mod.SensorChart), { ssr: false, loading: () => <div className="h-64 w-full flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> });

interface SensorLog {
  id: string;
  suhu: number;
  tanah: number;
  cahaya: number;
  createdAt: string;
}

export default function HistorySensorWidget({ isLoading, sensorLogs, chartData, variant }: { isLoading: boolean, sensorLogs: SensorLog[], chartData: any, variant?: WidgetVariant }) {
  const sensorContent = (
    <>
      <div className="flex items-center gap-2 mb-6 shrink-0">
        <div className="p-2 bg-primary/10 text-primary rounded-lg">
          <Sun className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold">Riwayat Lingkungan</h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : sensorLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-500">Belum ada data telemetri.</div>
        ) : (
          <div className="flex flex-col gap-6">
            <SensorChart data={chartData} />

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Waktu</th>
                    <th className="px-4 py-3">Suhu</th>
                    <th className="px-4 py-3">Kelembapan</th>
                    <th className="px-4 py-3 rounded-tr-lg">Cahaya</th>
                  </tr>
                </thead>
                <tbody>
                  {sensorLogs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{new Date(log.createdAt).toLocaleString("id-ID")}</td>
                      <td className="px-4 py-3">{log.suhu > 0 ? `${log.suhu}°C` : '-'}</td>
                      <td className="px-4 py-3">{log.tanah}</td>
                      <td className="px-4 py-3">{log.cahaya}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );

  const renderContent = () => {
    if (variant === "minimal") {
      return (
        <div className="bg-transparent border-l-4 border-primary pl-4 py-2 flex flex-col h-full pointer-events-auto relative">
          {sensorContent}
        </div>
      );
    }

    if (variant === "glassmorphism") {
      return (
        <div className="bg-surface backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] h-full flex flex-col relative overflow-hidden pointer-events-auto">
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full bg-primary/20 blur-2xl"></div>
          <div className="flex-1 flex flex-col relative z-10">
            {sensorContent}
          </div>
        </div>
      );
    }

    if (variant === "solid") {
      return (
        <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-6 shadow-xl h-full flex flex-col relative overflow-hidden pointer-events-auto">
          <div className="flex-1 flex flex-col relative z-10">
            {sensorContent}
          </div>
        </div>
      );
    }

    if (variant === "neon") {
      return (
        <div className="bg-background border border-primary/50 rounded-xl p-6 flex flex-col h-full relative overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.3),inset_0_0_20px_rgba(16,185,129,0.1)] pointer-events-auto">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-70"></div>
          <div className="flex-1 flex flex-col relative z-10">
            {sensorContent}
          </div>
        </div>
      );
    }

    if (variant === "neobrutalism") {
      return (
        <div className="border-4 border-black rounded-xl p-6 flex flex-col h-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-surface pointer-events-auto">
          <div className="flex-1 flex flex-col relative">
            {sensorContent}
          </div>
        </div>
      );
    }

    if (variant === "neumorphism") {
      return (
        <div className="bg-[#e0e5ec] dark:bg-slate-800 rounded-3xl p-6 flex flex-col h-full shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(255,255,255,0.05)] border-none pointer-events-auto overflow-hidden">
          <div className="flex-1 flex flex-col relative">
            {sensorContent}
          </div>
        </div>
      );
    }

    // Default UI
    return (
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl backdrop-blur-xl h-full flex flex-col overflow-hidden pointer-events-auto">
        {sensorContent}
      </div>
    );
  };

  return renderContent();
}
