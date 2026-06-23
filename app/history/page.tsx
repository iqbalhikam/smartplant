"use client";

import React, { useEffect, useState } from "react";
import { useDeviceStore } from "../../store/useDeviceStore";
import { Loader2, RefreshCw, Thermometer, Droplets, Sun, BrainCircuit, History } from "lucide-react";
import DashboardHeader from "../../components/DashboardHeader";
import { useRouter } from "next/navigation";

interface SensorLog {
  id: string;
  suhu: number;
  tanah: number;
  cahaya: number;
  createdAt: string;
}

interface ActionLog {
  id: string;
  kodeRule: string;
  durasiPompaMs: number;
  lampuNyala: boolean;
  createdAt: string;
}

export default function HistoryPage() {
  const { activeDeviceId } = useDeviceStore();
  const router = useRouter();

  const [sensorLogs, setSensorLogs] = useState<SensorLog[]>([]);
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!activeDeviceId) return;
    setIsLoading(true);
    try {
      const [sensorRes, actionRes] = await Promise.all([
        fetch(`/api/logs/sensor?deviceId=${activeDeviceId}`),
        fetch(`/api/logs/action?deviceId=${activeDeviceId}`)
      ]);
      const sensorData = await sensorRes.json();
      const actionData = await actionRes.json();

      if (sensorData.success) setSensorLogs(sensorData.data);
      if (actionData.success) setActionLogs(actionData.data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeDeviceId]);

  if (!activeDeviceId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-500">
        <History className="w-12 h-12 mb-4 opacity-50" />
        <p>Silakan kembali ke Dashboard dan pilih alat terlebih dahulu.</p>
        <button onClick={() => router.push("/")} className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg">Ke Dashboard</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Simple Header for History Page */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-bold bg-linear-to-r from-teal-500 to-indigo-500 bg-clip-text text-transparent flex items-center gap-2">
              <History className="w-6 h-6 text-teal-500" />
              Riwayat Data Perangkat
            </h1>
            <p className="text-sm text-slate-500 mt-1">ID: <span className="font-mono">{activeDeviceId}</span></p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Kembali ke Dashboard
            </button>
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 rounded-xl hover:bg-teal-500/20 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Sensor History Table */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <Sun className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold">Riwayat Lingkungan</h2>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>
            ) : sensorLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-500">Belum ada data telemetri.</div>
            ) : (
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
            )}
          </div>

          {/* Action History Table */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold">Keputusan AI (Fuzzy Logic)</h2>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>
            ) : actionLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-500">Belum ada data keputusan penyiraman.</div>
            ) : (
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
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
