import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wifi, WifiOff, Loader2, LogOut, LayoutDashboard, Settings, History } from "lucide-react";
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
    <header className="flex items-center justify-between h-14 px-2 sm:px-4 bg-surface/60 backdrop-blur-md border-b border-border shadow-[0_4px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] shrink-0 z-50">
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden shadow-sm bg-surface p-0.5 border border-border">
          <Image src="/image/LOGO.png" alt="SmartPlantCare Logo" fill sizes="32px" priority className="object-contain" />
        </div>
        <h1 className="text-lg font-extrabold tracking-tight bg-linear-to-r from-primary via-primary to-primary dark:from-teal-200 dark:via-emerald-200 dark:to-indigo-100 bg-clip-text text-transparent hidden sm:block">
          SmartPlantCare
        </h1>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Navigation */}
        <nav className="flex items-center gap-1 mr-1 sm:mr-2 border-r border-border pr-1 sm:pr-2">
          <Link
            href="/"
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
              pathname === "/" ? "bg-primary text-white" : "text-text-secondary hover:bg-black/5 dark:hover:bg-white/10"
            }`}
            title="Dashboard"
          >
            <LayoutDashboard className="w-4 h-4" />
          </Link>
          <Link
            href="/history"
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
              pathname === "/history" ? "bg-primary text-white" : "text-text-secondary hover:bg-black/5 dark:hover:bg-white/10"
            }`}
            title="Riwayat Data"
          >
            <History className="w-4 h-4" />
          </Link>
          <Link
            href="/settings"
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
              pathname === "/settings" ? "bg-primary text-white" : "text-text-secondary hover:bg-black/5 dark:hover:bg-white/10"
            }`}
            title="Pengaturan"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </nav>

        {/* Demo Mode Badge */}
        {isDemoMode && (
          <span className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md text-[10px] font-bold bg-primary/10 text-primary dark:text-secondary border border-primary/20 animate-pulse">
            <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-secondary" />
            DEMO
          </span>
        )}

        {/* Connection Status Badge */}
        {!isDemoMode && (
          <span className={`flex items-center justify-center w-6 h-6 sm:w-auto sm:h-auto sm:px-2 sm:py-1 rounded-md text-[10px] font-bold border ${
            connectionStatus === "connected"
              ? "bg-primary/10 text-primary dark:text-secondary border-primary/20"
              : (connectionStatus === "connecting" || connectionStatus === "verifying")
                ? "bg-warning/10 text-amber-600 dark:text-amber-400 border-warning/20"
                : "bg-danger/10 text-rose-600 dark:text-rose-400 border-danger/20"
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
          className="p-1.5 sm:p-2 rounded-lg transition-colors border border-danger/20 bg-danger/10 text-rose-600 dark:text-rose-400 hover:bg-danger/20 active:scale-95 cursor-pointer"
          title="Ganti Alat"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
