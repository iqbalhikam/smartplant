import React from "react";
import { Droplet, Wifi, WifiOff, Loader2, LogOut } from "lucide-react";

interface DashboardHeaderProps {
  isDemoMode: boolean;
  connectionStatus: "disconnected" | "connecting" | "connected" | "error";
  deviceId: string;
  onDisconnect: () => void;
}

export default function DashboardHeader({
  isDemoMode,
  connectionStatus,
  deviceId,
  onDisconnect
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 border-b border-slate-900 pb-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-linier-to-tr from-teal-500 to-emerald-400 rounded-xl shadow-lg shadow-teal-500/20">
          <Droplet className="w-8 h-8 text-slate-950 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-linier-to-r from-teal-200 via-emerald-200 to-indigo-100 bg-clip-text text-transparent">
            SmartPlant Dashboard
          </h1>
          <p className="text-xs text-slate-400 font-medium">Monitoring & Kontrol Penyiram Tanaman Cerdas</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Demo Mode Badge */}
        {isDemoMode && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            SIMULATOR (DEMO)
          </span>
        )}

        {/* Connection Status Badge */}
        {!isDemoMode && (
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            connectionStatus === "connected"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : connectionStatus === "connecting"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
          }`}>
            {connectionStatus === "connected" ? (
              <>
                <Wifi className="w-3.5 h-3.5" />
                ONLINE
              </>
            ) : connectionStatus === "connecting" ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                CONNECTING
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                OFFLINE
              </>
            )}
          </span>
        )}

        {/* Disconnect Button */}
        <button
          onClick={onDisconnect}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all duration-300 border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 active:scale-95 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          GANTI ALAT
        </button>
      </div>
    </header>
  );
}
