"use client";

import React, { useEffect, useState } from "react";
import { useDeviceStore } from "../../store/useDeviceStore";
import { Loader2, RefreshCw, History } from "lucide-react";
import SharedGridLayout from "../../components/SharedGridLayout";
import { useRouter } from "next/navigation";

import HistorySensorWidget from "../../components/HistorySensorWidget";
import HistoryActionWidget from "../../components/HistoryActionWidget";

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

  const fetchData = async (background = false) => {
    if (!activeDeviceId) return;
    if (!background) setIsLoading(true);
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
      if (!background) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh setiap 5 detik untuk mendapatkan data realtime
    const interval = setInterval(() => {
      fetchData(true);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [activeDeviceId]);

  const sensorChartData = React.useMemo(() => {
    return [...sensorLogs].reverse().map(log => ({
      ...log,
      time: new Date(log.createdAt).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })
    }));
  }, [sensorLogs]);

  const actionChartData = React.useMemo(() => {
    return [...actionLogs].reverse().map(log => ({
      ...log,
      time: new Date(log.createdAt).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })
    }));
  }, [actionLogs]);

  if (!activeDeviceId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-500">
        <History className="w-12 h-12 mb-4 opacity-50" />
        <p>Silakan kembali ke Dashboard dan pilih alat terlebih dahulu.</p>
        <button onClick={() => router.push("/")} className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg">Ke Dashboard</button>
      </div>
    );
  }

  const renderWidget = (type: string) => {
    switch (type) {
      case "history-sensor": 
        return <HistorySensorWidget isLoading={isLoading} sensorLogs={sensorLogs} chartData={sensorChartData} />;
      case "history-action": 
        return <HistoryActionWidget isLoading={isLoading} actionLogs={actionLogs} chartData={actionChartData} />;
      default: 
        return null;
    }
  };

  return (
    <div className="h-full w-full overflow-hidden flex flex-col">
      {/* Simple Header for History Page */}
      <div className="flex items-center justify-between p-4 md:px-8 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold bg-linear-to-r from-teal-500 to-indigo-500 bg-clip-text text-transparent flex items-center gap-2">
            <History className="w-5 h-5 text-teal-500" />
            Riwayat Data Perangkat
          </h1>
          <p className="text-xs text-slate-500 mt-1">ID: <span className="font-mono">{activeDeviceId}</span></p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            Kembali
          </button>
          <button
            onClick={() => fetchData(false)}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 text-xs bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 rounded-lg hover:bg-teal-500/20 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <SharedGridLayout pageName="history" renderWidget={renderWidget} />
      </div>
    </div>
  );
}
