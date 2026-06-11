import React, { useState, useEffect, useRef } from "react";
import {
  Settings,
  Droplets,
  Thermometer,
  Zap,
  Upload,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  WifiOff,
  Cpu,
  Crosshair,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { SmartPlantData } from "../types";
import CalibrationWizardModal from "./CalibrationWizardModal";

interface SystemSettingsCardProps {
  publishCommand: (command: string) => void;
  telemetry: SmartPlantData;
  otaLogs?: string[];
  clearOtaLogs?: () => void;
}

const GITHUB_REPO = "iqbalhikam/smartplant-firmware";
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } },
};

interface ToggleRowProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  enabled: boolean;
  accentColor: string;
  onToggle: () => void;
  isComingSoon?: boolean;
}

function ToggleRow({ label, description, icon, iconBg, enabled, accentColor, onToggle, isComingSoon }: ToggleRowProps) {
  return (
    <div className={`flex items-center justify-between gap-4 py-3 border-b border-slate-800/60 last:border-b-0 ${
      isComingSoon ? "opacity-60" : ""
    }`}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={`p-2 shrink-0 ${iconBg} rounded-xl ${isComingSoon ? "grayscale" : ""}`}>{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 xl:gap-2">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{label}</p>
            {isComingSoon && (
              <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider bg-violet-500/15 border border-violet-500/30 text-violet-400 whitespace-nowrap">
                Segera Hadir
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
            {isComingSoon ? "Fitur ini belum tersedia" : description}
          </p>
        </div>
      </div>
      <button
        onClick={isComingSoon ? undefined : onToggle}
        disabled={isComingSoon}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          isComingSoon
            ? "bg-slate-200 dark:bg-slate-800 cursor-not-allowed"
            : `cursor-pointer ${enabled ? accentColor : "bg-slate-300 dark:bg-slate-700"}`
        }`}
        aria-label={`Toggle ${label}`}
        title={isComingSoon ? "Fitur ini belum tersedia" : undefined}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out ${
            isComingSoon
              ? "translate-x-0 bg-slate-400 dark:bg-slate-600"
              : `bg-white ${enabled ? "translate-x-5" : "translate-x-0"}`
          }`}
        />
      </button>
    </div>
  );
}

type OtaInstallStatus = "idle" | "confirming" | "installing" | "sent";

export default function SystemSettingsCard({ publishCommand, telemetry, otaLogs = [], clearOtaLogs }: SystemSettingsCardProps) {
  const [waterTankEnabled, setWaterTankEnabled] = useState(false);
  const [tempSensorEnabled, setTempSensorEnabled] = useState(false);

  // GitHub release state
  const [latestVersion, setLatestVersion] = useState<string>("");
  const [otaUpdateUrl, setOtaUpdateUrl] = useState<string>("");
  const [githubFetched, setGithubFetched] = useState(false);

  // Calibration Wizard state
  const [calibrationModalOpen, setCalibrationModalOpen] = useState(false);

  // OTA install flow
  const [otaInstallStatus, setOtaInstallStatus] = useState<OtaInstallStatus>("idle");

  // Auto-scroll log
  const logEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [otaLogs]);

  // Device version from MQTT telemetry
  const deviceVersion = telemetry.version ?? null;

  // Auto-reset OTA state if the device version updates to the latest version
  useEffect(() => {
    if ((otaInstallStatus === "installing" || otaInstallStatus === "sent") && deviceVersion && latestVersion && deviceVersion === latestVersion) {
      setOtaInstallStatus("idle");
      toast.success("Update OTA Berhasil!", {
        description: `Perangkat telah berhasil diperbarui ke versi ${latestVersion}.`
      });
      clearOtaLogs?.();
    }
  }, [deviceVersion, latestVersion, otaInstallStatus, clearOtaLogs]);

  // Determine whether an update is available
  const hasUpdate =
    githubFetched &&
    !!latestVersion &&
    !!deviceVersion &&
    latestVersion !== deviceVersion;

  // Silent GitHub API fetch — never crashes UI on 404 or network error
  const fetchLatestRelease = async () => {
    setGithubFetched(false);
    try {
      const response = await fetch(GITHUB_API_URL, {
        headers: { Accept: "application/vnd.github+json" },
        cache: "no-store",
      });

      // Treat 404 (no releases yet) as "no update available" — silently return
      if (response.status === 404) {
        setGithubFetched(true);
        return;
      }

      if (!response.ok) {
        // Other HTTP errors: silently treat as no update
        console.warn(`[OTA] GitHub API non-ok: ${response.status}`);
        setGithubFetched(true);
        return;
      }

      const data = await response.json();
      const tag: string = data.tag_name ?? "";
      const downloadUrl: string = data.assets?.[0]?.browser_download_url ?? "";

      setLatestVersion(tag);
      setOtaUpdateUrl(downloadUrl);
      setGithubFetched(true);
    } catch (err) {
      // Network / parse error: silently treat as no update
      console.warn("[OTA] GitHub API unreachable:", err);
      setGithubFetched(true);
    }
  };

  useEffect(() => {
    fetchLatestRelease();
  }, []);

  // Module toggles
  const handleWaterToggle = () => {
    const next = !waterTankEnabled;
    setWaterTankEnabled(next);
    publishCommand(`CONFIG:WATER:${next ? "ON" : "OFF"}`);
    if (next) {
      toast.success("Modul level air berhasil diaktifkan");
    } else {
      toast.success("Modul level air berhasil dinonaktifkan");
    }
  };

  const handleTempToggle = () => {
    const next = !tempSensorEnabled;
    setTempSensorEnabled(next);
    publishCommand(`CONFIG:SUHU:${next ? "ON" : "OFF"}`);
    if (next) {
      toast.success("Modul suhu berhasil diaktifkan");
    } else {
      toast.success("Modul suhu berhasil dinonaktifkan");
    }
  };

  // OTA install handlers
  const handleInstallClick = () => {
    if (otaInstallStatus === "idle") {
      setOtaInstallStatus("confirming");
    } else if (otaInstallStatus === "confirming") {
      clearOtaLogs?.();
      setOtaInstallStatus("installing");
      publishCommand(`OTA:${otaUpdateUrl}`);

      toast.success("Perintah update dikirim!", {
        description:
          "Alat akan mati sementara dan menyala kembali dalam 1-2 menit. Jangan cabut listrik.",
        duration: 8000,
      });

      setTimeout(() => setOtaInstallStatus("sent"), 3000);
    }
  };

  const handleInstallCancel = () => setOtaInstallStatus("idle");

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-6 pt-5 pb-4 border-b border-slate-200 dark:border-slate-800/60">
        <div className="p-2 bg-teal-500/10 border border-teal-500/20 rounded-xl">
          <Settings className="w-4 h-4 text-teal-500 dark:text-teal-400" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 tracking-wide text-sm">Pengaturan Sistem</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Konfigurasi modul perangkat keras IoT</p>
        </div>
      </div>

      {/* Module Toggles & Actions */}
      <div className="px-6 py-4 space-y-0">
        <ToggleRow
          label="Modul Tangki Air"
          description={waterTankEnabled ? "Monitoring level air aktif" : "Modul dinonaktifkan"}
          icon={<Droplets className="w-4 h-4 text-sky-400" />}
          iconBg="bg-sky-500/10 border border-sky-500/20"
          enabled={waterTankEnabled}
          accentColor="bg-sky-500"
          onToggle={handleWaterToggle}
        />

        <ToggleRow
          label="Modul Sensor Suhu"
          description={tempSensorEnabled ? "Sensor DHT22 aktif dan terbaca" : "Modul dinonaktifkan"}
          icon={<Thermometer className="w-4 h-4 text-orange-400" />}
          iconBg="bg-orange-500/10 border border-orange-500/20"
          enabled={tempSensorEnabled}
          accentColor="bg-orange-500"
          onToggle={handleTempToggle}
        />
        
        <div className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 shrink-0 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <Crosshair className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">Kalibrasi Ulang Sensor</p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
                Sesuaikan akurasi kelembapan tanah
              </p>
            </div>
          </div>
          <button
            onClick={() => setCalibrationModalOpen(true)}
            className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold transition-colors cursor-pointer active:scale-95"
          >
            Mulai Kalibrasi
          </button>
        </div>
      </div>

      {/* OTA Update Section */}
      <div className="mx-6 mb-5 p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 rounded-xl space-y-3">
        {/* OTA Section header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pembaruan Firmware (OTA)
            </span>
          </div>
          <button
            onClick={() => { setOtaInstallStatus("idle"); fetchLatestRelease(); }}
            disabled={!githubFetched}
            className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Cek ulang pembaruan"
          >
            <RefreshCw className={`w-3 h-3 ${!githubFetched ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Version row */}
        <div className="flex items-center justify-between gap-2 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/40 rounded-xl px-3 py-2.5">
          <div className="flex items-center gap-2 shrink-0">
            <Cpu className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">Versi Alat:</span>
          </div>
          <span className={`font-mono text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md truncate ${
            deviceVersion
              ? "text-teal-600 dark:text-teal-400 bg-teal-500/10"
              : "text-slate-500 bg-slate-200 dark:bg-slate-800/60 animate-pulse"
          }`}>
            {deviceVersion ?? "Mendeteksi..."}
          </span>
        </div>

        {/* OTA Status UI */}
        <AnimatePresence mode="wait">

          {/* Loading GitHub fetch */}
          {!githubFetched && (
            <motion.div
              key="gh-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-slate-500 text-[10px]"
            >
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Memeriksa pembaruan dari GitHub...</span>
            </motion.div>
          )}

          {/* Up-to-date / no update */}
          {githubFetched && !hasUpdate && otaInstallStatus === "idle" && (
            <motion.div
              key="up-to-date"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <p className="text-[10px] text-emerald-300 font-medium">
                Sistem Up-to-Date
                {deviceVersion ? ` (Versi: ${deviceVersion})` : ""}
              </p>
            </motion.div>
          )}

          {/* Update available banner + install button */}
          {githubFetched && hasUpdate && otaInstallStatus === "idle" && (
            <motion.div
              key="update-available"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-2.5"
            >
              <div className="flex items-start gap-2 p-2.5 bg-amber-500/10 border border-amber-500/25 rounded-lg">
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                <p className="text-[10px] text-amber-300 font-semibold leading-relaxed">
                  Update Firmware Tersedia: <span className="font-mono">{latestVersion}</span>!
                </p>
              </div>
              <button
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white rounded-xl text-xs font-bold tracking-wide transition-all duration-300 shadow-lg shadow-violet-500/15 active:scale-95 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Install Update Sekarang
              </button>
            </motion.div>
          )}

          {/* Confirming */}
          {otaInstallStatus === "confirming" && (
            <motion.div
              key="confirming"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-2.5"
            >
              <div className="flex items-start gap-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-300 font-medium leading-relaxed">
                  Alat akan restart otomatis saat update berjalan. Pastikan pompa dalam kondisi mati sebelum melanjutkan.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleInstallCancel}
                  className="flex-1 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95"
                >
                  Batal
                </button>
                <button
                  onClick={handleInstallClick}
                  className="flex-1 py-2 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 rounded-xl text-xs font-black transition-all duration-200 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95"
                >
                  Ya, Install Sekarang!
                </button>
              </div>
            </motion.div>
          )}

          {/* Installing (loading) */}
          {otaInstallStatus === "installing" && (
            <motion.div
              key="installing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2.5 py-2.5 text-violet-300"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs font-semibold animate-pulse">Mengirim perintah OTA ke alat...</span>
            </motion.div>
          )}

          {/* Sent + live log terminal */}
          {otaInstallStatus === "sent" && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2.5"
            >
              {/* Success banner */}
              <div className="flex items-center gap-2.5 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-emerald-300">Perintah OTA Terkirim!</p>
                  <p className="text-[10px] text-slate-400">
                    Menunggu log progress dari alat via topik{" "}
                    <span className="font-mono text-teal-400">/ota</span>...
                  </p>
                </div>
              </div>

              {/* Terminal log panel */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden">
                {/* Title bar */}
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-200 dark:border-slate-800/60 bg-slate-100 dark:bg-slate-900/60">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                  <span className="ml-2 text-[10px] font-mono text-slate-500 tracking-wider">
                    {latestVersion || "OTA"} — progress log
                  </span>
                  {otaLogs.length > 0 && (
                    <button
                      onClick={() => clearOtaLogs?.()}
                      className="ml-auto text-[9px] text-slate-600 hover:text-slate-400 transition-colors cursor-pointer"
                    >
                      CLEAR
                    </button>
                  )}
                </div>

                {/* Log lines */}
                <div className="h-36 overflow-y-auto p-3 space-y-1 font-mono text-[10px] leading-relaxed scroll-smooth">
                  {otaLogs.length === 0 ? (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="animate-pulse">Menunggu respons dari perangkat...</span>
                    </div>
                  ) : (
                    otaLogs.map((log, i) => {
                      const isError = /error|fail|gagal/i.test(log);
                      const isSuccess = /success|selesai|done|ok|complete|reboot|restart/i.test(log);
                      const isProgress = /\d+%/.test(log);
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.15 }}
                          className={`flex gap-1.5 ${
                            isError
                              ? "text-rose-400"
                              : isSuccess
                              ? "text-emerald-400"
                              : isProgress
                              ? "text-violet-400"
                              : "text-slate-400"
                          }`}
                        >
                          <span className="text-slate-600 shrink-0">›</span>
                          <span>{log}</span>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={logEndRef} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CalibrationWizardModal
        isOpen={calibrationModalOpen}
        onClose={() => setCalibrationModalOpen(false)}
        telemetry={telemetry}
        publishCommand={publishCommand}
      />
    </motion.div>
  );
}
