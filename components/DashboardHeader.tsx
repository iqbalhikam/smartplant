import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wifi, WifiOff, Loader2, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import DeviceSelector from "./DeviceSelector";

interface DashboardHeaderProps {
  isDemoMode: boolean;
  connectionStatus: "disconnected" | "connecting" | "connected" | "error" | "verifying";
  deviceId: string;
  onDisconnect: () => void;
}

export default function DashboardHeader({
  isDemoMode,
  connectionStatus,
  deviceId,
  onDisconnect
}: DashboardHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between h-14 px-2 sm:px-4 bg-white/40 backdrop-blur-md border-b border-white/50 shadow-[0_4px_30px_rgba(0,0,0,0.1)] dark:bg-slate-800/40 dark:border-white/10 dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] shrink-0 z-50">
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden shadow-sm bg-white dark:bg-white/5 p-0.5 border border-slate-200 dark:border-transparent">
          <Image src="/image/LOGO.png" alt="SmartPlantCare Logo" fill sizes="32px" priority className="object-contain" />
        </div>
        <h1 className="text-lg font-extrabold tracking-tight bg-linear-to-r from-teal-600 via-emerald-600 to-indigo-600 dark:from-teal-200 dark:via-emerald-200 dark:to-indigo-100 bg-clip-text text-transparent hidden sm:block">
          SmartPlantCare
        </h1>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Navigation */}
        <nav className="flex items-center gap-1 mr-1 sm:mr-2 border-r border-slate-300 dark:border-slate-700 pr-1 sm:pr-2">
          <Link
            href="/"
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
              pathname === "/" ? "bg-teal-500 text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
            title="Dashboard"
          >
            <LayoutDashboard className="w-4 h-4" />
          </Link>
          <Link
            href="/settings"
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
              pathname === "/settings" ? "bg-teal-500 text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
            title="Pengaturan"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </nav>

        {/* Demo Mode Badge */}
        {isDemoMode && (
          <span className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 animate-pulse">
            <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-indigo-400" />
            DEMO
          </span>
        )}

        {/* Connection Status Badge */}
        {!isDemoMode && (
          <span className={`flex items-center justify-center w-6 h-6 sm:w-auto sm:h-auto sm:px-2 sm:py-1 rounded-md text-[10px] font-bold border ${
            connectionStatus === "connected"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              : (connectionStatus === "connecting" || connectionStatus === "verifying")
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
          }`}>
            {connectionStatus === "connected" ? (
              <Wifi className="w-3 h-3" />
            ) : (connectionStatus === "connecting" || connectionStatus === "verifying") ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <WifiOff className="w-3 h-3" />
            )}
          </span>
        )}

        <DeviceSelector />
        <ThemeToggle />

        <button
          onClick={onDisconnect}
          className="p-1.5 sm:p-2 rounded-lg transition-colors border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 active:scale-95 cursor-pointer"
          title="Ganti Alat"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
