import React from 'react';
import { Loader2, Sun } from "lucide-react";
import dynamic from "next/dynamic";

const SensorChart = dynamic(() => import("./HistoryCharts").then(mod => mod.SensorChart), { ssr: false, loading: () => <div className="h-64 w-full flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div> });

interface SensorLog {
  id: string;
  suhu: number;
  tanah: number;
  cahaya: number;
  createdAt: string;
}

export default function HistorySensorWidget({ isLoading, sensorLogs, chartData }: { isLoading: boolean, sensorLogs: SensorLog[], chartData: any }) {
  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-xl h-full flex flex-col overflow-hidden pointer-events-auto">
      <div className="flex items-center gap-2 mb-6 shrink-0">
        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
          <Sun className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold">Riwayat Lingkungan</h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>
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
    </div>
  );
}
