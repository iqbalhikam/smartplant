import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Cpu,
  QrCode,
  Bluetooth,
  Wifi,
  Lock,
  AlertTriangle,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import QRScanner from "./QRScanner";

interface OnboardingScreenProps {
  deviceId: string;
  setDeviceId: (val: string) => void;
  onConnect: (explicitId?: string, isNewDevice?: boolean) => void;
  onDemo: () => void;
  connectionStatus: string;
  mqttError: string | null;
  clearError: () => void;
  savedDevices?: string[];
  isVerifying?: boolean;
}

export default function OnboardingScreen({
  deviceId,
  setDeviceId,
  onConnect,
  onDemo,
  connectionStatus,
  mqttError,
  clearError,
  savedDevices = [],
  isVerifying = false
}: OnboardingScreenProps) {
  const [showScanner, setShowScanner] = useState(false);
  const [showWifiSetup, setShowWifiSetup] = useState(false);

  // BLE WiFi provisioning state
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [ssidList, setSsidList] = useState<string[]>([]);
  const [bleLoading, setBleLoading] = useState(false);
  const [bleStatusText, setBleStatusText] = useState("");
  const [bleError, setBleError] = useState<string | null>(null);
  const [isBleSupported, setIsBleSupported] = useState(true);

  // Connection references to reuse for credential dispatch without double pairing prompt
  const bleDeviceRef = useRef<any>(null);
  const rxCharRef = useRef<any>(null);

  useEffect(() => {
    const nav = typeof navigator !== "undefined" ? (navigator as any) : null;
    if (!nav || !nav.bluetooth || !nav.bluetooth.requestDevice) {
      setIsBleSupported(false);
    }
  }, []);

  // Clean up Bluetooth connection on unmount
  useEffect(() => {
    return () => {
      if (bleDeviceRef.current && bleDeviceRef.current.gatt?.connected) {
        try {
          bleDeviceRef.current.gatt.disconnect();
        } catch (e) {
          console.warn("Clean up disconnect on unmount failed:", e);
        }
      }
    };
  }, []);

  // Automatically suggest WiFi setup if MQTT connection fails/errors out
  useEffect(() => {
    if (mqttError) {
      toast.error("Alat tidak ditemukan. Apakah sudah terhubung ke WiFi?", {
        action: {
          label: "Setup WiFi",
          onClick: () => {
            clearError();
            setShowWifiSetup(true);
          }
        },
        duration: 8000
      });
    }
  }, [mqttError]);

  const resetBleProvisioning = () => {
    const device = bleDeviceRef.current;
    bleDeviceRef.current = null;
    rxCharRef.current = null;
    
    if (device && device.gatt?.connected) {
      try {
        device.gatt.disconnect();
      } catch (e) {
        console.warn("Disconnection failed:", e);
      }
    }
    setWifiSsid("");
    setWifiPassword("");
    setSsidList([]);
    setBleLoading(false);
    setBleStatusText("");
  };

  const handleBleScan = async () => {
    const nav = typeof navigator !== "undefined" ? (navigator as any) : null;
    if (!nav || !nav.bluetooth || !nav.bluetooth.requestDevice) {
      toast.error("Browser Anda tidak mendukung Web Bluetooth.");
      return;
    }

    setBleLoading(true);
    setBleStatusText("Mencari alat SmartPlantCare...");
    setBleError(null);
    setSsidList([]);

    const serviceUuid = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
    const rxCharUuid = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
    const txCharUuid = "cba1d466-344c-4be3-ab3f-189f80dd7518";

    try {
      toast.loading("Mencari alat SmartPlantCare...", { id: "ble-toast" });
      
      const device = await nav.bluetooth.requestDevice({
        filters: [
          { name: "SmartPlant-BLE" },
          { services: [serviceUuid] }
        ],
        optionalServices: [serviceUuid]
      });

      bleDeviceRef.current = device;

      const onDisconnect = () => {
        console.warn("GATT server disconnected.");
        if (rxCharRef.current) {
          setBleError("Koneksi terputus dengan alat.");
          toast.error("Alat Bluetooth terputus.", { id: "ble-toast" });
          resetBleProvisioning();
        }
      };
      device.addEventListener("gattserverdisconnected", onDisconnect);

      setBleStatusText(`Menghubungkan ke ${device.name || "Alat"}...`);
      toast.loading(`Menghubungkan ke ${device.name || "Alat"}...`, { id: "ble-toast" });
      
      const server = await device.gatt?.connect();
      if (!server) {
        throw new Error("Gagal terhubung ke GATT Server.");
      }

      setBleStatusText("Menemukan service WiFi...");
      toast.loading("Menemukan service WiFi...", { id: "ble-toast" });
      
      const service = await server.getPrimaryService(serviceUuid);
      
      const rxChar = await service.getCharacteristic(rxCharUuid);
      rxCharRef.current = rxChar;

      const txChar = await service.getCharacteristic(txCharUuid);

      setBleStatusText("Mempersiapkan penerimaan data...");
      toast.loading("Mempersiapkan penerimaan data...", { id: "ble-toast" });
      
      await txChar.startNotifications();
      
      txChar.addEventListener("characteristicvaluechanged", (event: any) => {
        try {
          const value = event.target.value;
          const decoder = new TextDecoder();
          const decodedText = decoder.decode(value);
          console.log("BLE Received TX raw:", decodedText);

          if (decodedText && decodedText.trim()) {
            const list = decodedText.split(",").map((s: string) => s.trim()).filter(Boolean);
            setSsidList(list);
            if (list.length > 0) {
              setWifiSsid(list[0]);
            }
          }
          
          toast.success("Pemindaian WiFi selesai!", { id: "ble-toast" });
          setBleLoading(false);
        } catch (decodeErr) {
          console.error("Failed to decode SSID list:", decodeErr);
        }
      });

      setBleStatusText("Memerintahkan alat men-scan WiFi...");
      toast.loading("Memerintahkan alat men-scan WiFi...", { id: "ble-toast" });
      
      const scanCmd = new TextEncoder().encode("SCAN");
      await rxChar.writeValue(scanCmd);

      setBleStatusText("Sedang memindai jaringan...");
    } catch (err: any) {
      console.error("Web Bluetooth Scan Error:", err);
      resetBleProvisioning();
      if (err.name === "NotFoundError" || err.message?.includes("User cancelled")) {
        toast.dismiss("ble-toast");
        setBleError("Pemilihan perangkat Bluetooth dibatalkan.");
      } else {
        const errMsg = err.message || "Gagal menghubungkan atau men-scan.";
        setBleError(errMsg);
        toast.error(`Koneksi Gagal: ${errMsg}`, { id: "ble-toast" });
      }
      setBleLoading(false);
    }
  };

  const handleBleSendCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wifiSsid) {
      toast.error("Silakan pilih SSID WiFi.");
      return;
    }

    if (!rxCharRef.current) {
      toast.error("Koneksi Bluetooth hilang. Silakan scan ulang.");
      return;
    }

    setBleLoading(true);
    setBleStatusText("Mengirim kredensial...");
    setBleError(null);

    try {
      toast.loading("Mengirim kredensial WiFi...", { id: "ble-toast" });
      
      const payload = `${wifiSsid}|${wifiPassword}`;
      const data = new TextEncoder().encode(payload);
      
      await rxCharRef.current.writeValue(data);

      toast.success("WiFi berhasil dikirim! Alat sedang merestart...", { id: "ble-toast" });
      resetBleProvisioning();
      setShowWifiSetup(false); // Go back to login screen to connect
    } catch (err: any) {
      console.error("Web Bluetooth Write Error:", err);
      const errMsg = err.message || "Gagal mengirim kredensial.";
      setBleError(errMsg);
      toast.error(`Gagal mengirim WiFi: ${errMsg}`, { id: "ble-toast" });
      setBleLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceId.trim()) return;
    onConnect(deviceId, true);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center font-sans selection:bg-teal-500 selection:text-black p-4">
      {/* Toaster removed from here as it is now in layout.tsx */}
      
      {/* Background Glowing Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-20%] w-[60vw] h-[60vw] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-20%] w-[60vw] h-[60vw] bg-emerald-500/5 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-md w-full z-10">
        {/* Brand / Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-20 h-20 bg-white/5 p-2 rounded-2xl shadow-xl shadow-teal-500/20 mb-3 animate-pulse">
            <Image src="/image/LOGO.png" alt="SmartPlantCare Logo" fill sizes="80px" priority className="object-contain p-1" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-teal-500 via-emerald-500 to-indigo-500 dark:from-teal-200 dark:via-emerald-200 dark:to-indigo-100 bg-clip-text text-transparent">
            SmartPlantCare
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wider mt-1 uppercase">IoT Irrigation System</p>
        </div>

        {/* Dynamic Card Navigation */}
        <AnimatePresence mode="wait">
          {!showWifiSetup ? (
            <motion.div
              key="device-id-connector"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl relative"
            >
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Device Onboarding</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Silakan masukkan Device ID alat SmartPlantCare Anda untuk mulai memonitor kelembapan secara real-time.
              </p>

              {/* MQTT Connection Error */}
              {mqttError && (
                <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs rounded-xl flex flex-col gap-2">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-rose-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-rose-200">Gagal Terhubung</p>
                      <p className="opacity-90 leading-relaxed text-[11px]">{mqttError}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      clearError();
                      setShowWifiSetup(true);
                    }}
                    className="mt-1 self-end text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition underline cursor-pointer"
                  >
                    Alat tidak terdeteksi? Setup WiFi Baru
                  </button>
                </div>
              )}

              {/* Saved Devices Section */}
              {savedDevices && savedDevices.length > 0 && (
                <div className="mb-6">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-3 uppercase">
                    Perangkat Tersimpan
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedDevices.map((devId) => (
                      <button
                        key={devId}
                        onClick={() => {
                          clearError();
                          setDeviceId(devId);
                          onConnect(devId, false);
                        }}
                        disabled={connectionStatus === "connecting" || connectionStatus === "verifying"}
                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-all text-left cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0">
                          <Cpu className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{devId}</p>
                          <p className="text-[10px] text-slate-500 truncate">Ketuk untuk masuk</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex items-center my-6">
                    <div className="flex-1 border-t border-slate-200 dark:border-slate-800/40" />
                    <span className="px-3 text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Atau Tambah Baru</span>
                    <div className="flex-1 border-t border-slate-200 dark:border-slate-800/40" />
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-2 uppercase">
                    Device ID (ID Perangkat)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={deviceId}
                      onChange={(e) => {
                        setDeviceId(e.target.value);
                        clearError();
                      }}
                      placeholder="Contoh: PLANT-751080"
                      className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/30 rounded-xl pl-10 pr-12 py-3.5 text-sm text-slate-800 dark:text-slate-200 font-mono tracking-wide placeholder-slate-400 dark:placeholder-slate-700 transition-all duration-300"
                    />
                    <div className="absolute left-3.5 top-4 text-slate-500">
                      <Cpu className="w-4.5 h-4.5" />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        clearError();
                        setShowScanner(true);
                      }}
                      className="absolute right-2.5 top-2.5 p-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 border border-slate-300 dark:border-slate-700/60 rounded-lg transition-colors cursor-pointer"
                      title="Scan QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={connectionStatus === "connecting" || connectionStatus === "verifying" || !deviceId.trim()}
                  className="w-full bg-linear-to-r from-teal-500 to-emerald-400 text-slate-950 hover:brightness-110 active:scale-95 disabled:opacity-50 py-3.5 rounded-xl text-xs font-black tracking-widest transition-all duration-300 shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {connectionStatus === "connecting" || connectionStatus === "verifying" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isVerifying ? "MEMVERIFIKASI..." : "MENGHUBUNGKAN..."}
                    </>
                  ) : (
                    "HUBUNGKAN ALAT"
                  )}
                </button>
              </form>

              {/* Action setup helper */}
              <div className="mt-5 text-center">
                <button
                  onClick={() => setShowWifiSetup(true)}
                  className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  <Wifi className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 animate-pulse" />
                  Alat belum terhubung ke WiFi? Setup WiFi Baru
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-slate-200 dark:border-slate-800/40" />
                <span className="px-3 text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Atau</span>
                <div className="flex-1 border-t border-slate-200 dark:border-slate-800/40" />
              </div>

              {/* Demo Button */}
              <button
                onClick={onDemo}
                className="w-full bg-slate-100 dark:bg-slate-950/40 hover:bg-slate-200 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 py-3 rounded-xl text-xs font-bold tracking-wider transition-all duration-300 active:scale-95 cursor-pointer"
              >
                Mulai dengan Simulator Demo
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="wifi-ble-setup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl relative"
            >
              <div className="flex items-center gap-2.5 mb-2 border-b border-slate-200 dark:border-slate-800/60 pb-3">
                <button
                  onClick={() => {
                    resetBleProvisioning();
                    setShowWifiSetup(false);
                  }}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg transition active:scale-90 cursor-pointer"
                  title="Kembali"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Setup WiFi Alat</h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Konfigurasi WiFi ESP32 via Bluetooth (WebBLE)</p>
                </div>
              </div>

              {!isBleSupported && (
                <div className="my-4 p-3.5 bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs rounded-xl flex items-start gap-2.5">
                  <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-0.5 text-amber-200">Web Bluetooth Tidak Didukung</p>
                    <p className="opacity-90 leading-relaxed text-[10px]">
                      Browser Anda tidak mendukung Web Bluetooth. Silakan gunakan Google Chrome, Microsoft Edge, atau Opera untuk melakukan setup WiFi secara nirkabel.
                    </p>
                  </div>
                </div>
              )}

              {bleError && (
                <div className="my-4 p-3.5 bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs rounded-xl flex items-start gap-2.5">
                  <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-rose-400 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-0.5 text-rose-200">Bluetooth Error</p>
                    <p className="opacity-90 leading-relaxed text-[10px]">{bleError}</p>
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                {/* Phase 1: Idle -> Show Bluetooth Search Trigger */}
                {!bleLoading && ssidList.length === 0 && (
                  <motion.div
                    key="scan-trigger"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 mt-4"
                  >
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Hubungkan ESP32 Anda ke WiFi lokal melalui Bluetooth. Klik tombol di bawah ini untuk mencari dan men-scan jaringan WiFi di sekitar perangkat ESP32 Anda.
                    </p>
                    <button
                      type="button"
                      disabled={!isBleSupported}
                      onClick={handleBleScan}
                      className="w-full bg-linear-to-r from-indigo-500 to-purple-500 text-white hover:brightness-110 active:scale-95 disabled:opacity-50 py-3.5 rounded-xl text-xs font-black tracking-widest transition-all duration-300 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Bluetooth className="w-4 h-4 animate-pulse" />
                      MULAI CARI WIFI VIA BLUETOOTH
                    </button>
                  </motion.div>
                )}

                {/* Phase 2: Active Connection & Scanning Spinner */}
                {bleLoading && ssidList.length === 0 && (
                  <motion.div
                    key="loading-spinner"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="py-8 flex flex-col items-center justify-center gap-3 mt-4"
                  >
                    <Loader2 className="w-8 h-8 text-indigo-500 dark:text-indigo-400 animate-spin" />
                    <p className="text-xs text-slate-500 dark:text-slate-300 font-semibold animate-pulse">{bleStatusText}</p>
                  </motion.div>
                )}

                {/* Phase 3: Scan complete -> Populate form drop down option mapping */}
                {ssidList.length > 0 && (
                  <motion.div
                    key="wifi-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4"
                  >
                    <form onSubmit={handleBleSendCredentials} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-2 uppercase">
                          Pilih Jaringan WiFi (SSID)
                        </label>
                        <div className="relative">
                          <select
                            disabled={bleLoading}
                            value={wifiSsid}
                            onChange={(e) => {
                              setWifiSsid(e.target.value);
                              setBleError(null);
                            }}
                            className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 rounded-xl pl-10 pr-10 py-3 text-xs text-slate-800 dark:text-slate-200 transition-all duration-300 disabled:opacity-50 appearance-none cursor-pointer"
                          >
                            {ssidList.map((ssid, index) => (
                              <option key={index} value={ssid} className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">
                                {ssid}
                              </option>
                            ))}
                          </select>
                          <div className="absolute left-3.5 top-3.5 text-slate-500 pointer-events-none">
                            <Wifi className="w-4 h-4" />
                          </div>
                          <div className="absolute right-3.5 top-3.5 text-slate-500 pointer-events-none text-xs">
                            ▼
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-2 uppercase">
                          Password WiFi
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            disabled={bleLoading}
                            value={wifiPassword}
                            onChange={(e) => {
                              setWifiPassword(e.target.value);
                              setBleError(null);
                            }}
                            placeholder="Masukkan password WiFi Anda"
                            className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-700 transition-all duration-300 disabled:opacity-50"
                          />
                          <div className="absolute left-3.5 top-3.5 text-slate-500">
                            <Lock className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          disabled={bleLoading}
                          onClick={resetBleProvisioning}
                          className="flex-1 bg-slate-200 dark:bg-slate-850 hover:bg-slate-300 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold py-3 transition duration-300 cursor-pointer active:scale-95"
                        >
                          BATAL
                        </button>
                        
                        <button
                          type="submit"
                          disabled={bleLoading || !wifiSsid}
                          className="flex-2 bg-linear-to-r from-indigo-500 to-purple-500 text-white hover:brightness-110 active:scale-95 disabled:opacity-50 rounded-xl text-xs font-black tracking-widest transition-all duration-300 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {bleLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              MENGIRIM...
                            </>
                          ) : (
                            <>
                              <Bluetooth className="w-4 h-4 animate-pulse" />
                              KIRIM KREDENSIAL
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showScanner && (
          <QRScanner
            onScanSuccess={(text) => {
              setDeviceId(text);
              setShowScanner(false);
            }}
            onClose={() => setShowScanner(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
