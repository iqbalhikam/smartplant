"use client";

import React, { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMQTTContext } from "./MQTTProvider";
import OnboardingScreen from "./OnboardingScreen";
import DashboardHeader from "./DashboardHeader";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const {
    config,
    deviceIdInput,
    setDeviceIdInput,
    isConnected,
    setIsConnected,
    loadingStorage,
    connectionStatus,
    isDemoMode,
    mqttError,
    setMqttError,
    handleConnect,
    handleEnterDemo,
    handleDisconnect,
    savedDevices,
    isVerifying
  } = useMQTTContext();

  const searchParams = useSearchParams();

  // Auto-Login via URL Query Parameter
  useEffect(() => {
    const urlDevice = searchParams.get("device");
    if (urlDevice && urlDevice.trim()) {
      const cleanDevice = urlDevice.trim();
      localStorage.setItem("deviceId", cleanDevice);
      localStorage.setItem("smartplant_device_id", cleanDevice);
      if (setIsConnected) {
        setIsConnected(true);
      }
      handleConnect(cleanDevice);
    }
  }, [searchParams]);

  if (loadingStorage) {
    return (
      <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-teal-500 dark:text-teal-400 animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium animate-pulse">Memuat konfigurasi...</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!isConnected ? (
        <motion.div
          key="onboarding-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <OnboardingScreen
            deviceId={deviceIdInput}
            setDeviceId={setDeviceIdInput}
            onConnect={handleConnect}
            onDemo={handleEnterDemo}
            connectionStatus={connectionStatus}
            mqttError={mqttError}
            clearError={() => setMqttError(null)}
            savedDevices={savedDevices}
            isVerifying={isVerifying}
          />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="relative h-screen w-full overflow-hidden flex flex-col bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-teal-500 selection:text-black"
        >
          {/* Background Glowing Blobs Container */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-emerald-500/5 rounded-full blur-[120px]" />
          </div>

          <div className="w-full h-full flex flex-col z-10 overflow-hidden">
            
            {/* Header Section */}
            <DashboardHeader
              isDemoMode={isDemoMode}
              connectionStatus={connectionStatus}
              deviceId={config.deviceId}
              onDisconnect={handleDisconnect}
            />

            {/* Content Body */}
            <main className="flex-1 w-full h-[calc(100vh-3.5rem)] overflow-hidden">
              {children}
            </main>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
      </div>
    }>
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  );
}
