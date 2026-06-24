import React from 'react';
import { Loader2, BrainCircuit } from "lucide-react";
import dynamic from "next/dynamic";

const ActionChart = dynamic(() => import("./HistoryCharts").then(mod => mod.ActionChart), { ssr: false, loading: () => <div className="h-64 w-full flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div> });

interface ActionLog {
  id: string;
  kodeRule: string;
  durasiPompaMs: number;
  lampuNyala: boolean;
  createdAt: string;
}

export default function HistoryActionWidget({ isLoading, actionLogs, chartData }: { isLoading: boolean, actionLogs: ActionLog[], chartData: any }) {
  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-xl h-full flex flex-col overflow-hidden pointer-events-auto">
      <div className="flex items-center gap-2 mb-6 shrink-0">
        <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
          <BrainCircuit className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold">Keputusan AI (Fuzzy Logic)</h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>
        ) : actionLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-500">Belum ada data keputusan penyiraman.</div>
        ) : (
          <div className="flex flex-col gap-6">
            <ActionChart data={chartData} />

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Waktu</th>
                    <th className="px-4 py-3">Kode Rule</th>
                    <th className="px-4 py-3">Durasi</th>
                    <th className="px-4 py-3 rounded-tr-lg">Lampu UV</th>
                  </tr>
                </thead>
                <tbody>
                  {actionLogs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{new Date(log.createdAt).toLocaleString("id-ID")}</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-mono text-xs text-indigo-600 dark:text-indigo-400">{log.kodeRule}</span></td>
                      <td className="px-4 py-3">{log.durasiPompaMs > 0 ? `${log.durasiPompaMs}ms` : 'Otomatis'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${log.lampuNyala ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                          {log.lampuNyala ? 'ON' : 'OFF'}
                        </span>
                      </td>
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
