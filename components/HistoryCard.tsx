import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, TrendingUp, History } from "lucide-react";
import Link from "next/link";
import { useMQTTContext } from "./MQTTProvider";

const SensorChart = dynamic(() => import("./HistoryCharts").then(mod => mod.SensorChart), { 
  ssr: false, 
  loading: () => <div className="h-full w-full flex justify-center items-center"><Loader2 className="w-6 h-6 animate-spin text-teal-500" /></div> 
});

interface SensorLog {
  id: string;
  suhu: number;
  tanah: number;
  createdAt: string;
}

export default function HistoryCard() {
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

  return (
    <div className="flex flex-col h-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden p-4 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/50 pb-2 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-teal-500/10 rounded-lg border border-teal-500/20 shadow-inner">
            <TrendingUp className="w-4 h-4 text-teal-500 dark:text-teal-400" />
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
        {isLoading ? (
          <div className="h-full w-full flex justify-center items-center">
            <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
          </div>
        ) : sensorLogs.length === 0 ? (
          <div className="h-full w-full flex justify-center items-center text-xs text-slate-500">
            Belum ada data
          </div>
        ) : (
          <div className="h-full w-full">
            <SensorChart data={chartData} />
          </div>
        )}
      </div>
    </div>
  );
}
