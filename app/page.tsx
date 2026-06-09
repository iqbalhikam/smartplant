"use client";

import React, { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMQTT } from "../hooks/useMQTT";
import OnboardingScreen from "../components/OnboardingScreen";
import DashboardHeader from "../components/DashboardHeader";
import SoilMoistureCard from "../components/SoilMoistureCard";
import LightSensorCard from "../components/LightSensorCard";
import ControlsCard from "../components/ControlsCard";
import AIAssistantCard from "../components/AIAssistantCard";
import ThresholdSettings from "../components/ThresholdSettings";
import SystemSettingsCard from "../components/SystemSettingsCard";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

function DashboardContent() {
  const {
    config,
    deviceIdInput,
    setDeviceIdInput,
    isConnected,
    setIsConnected,
    loadingStorage,
    telemetry,
    connectionStatus,
    isDemoMode,
    mqttError,
    setMqttError,
    otaLogs,
    clearOtaLogs,
    handleConnect,
    handleEnterDemo,
    handleDisconnect,
    publishCommand
  } = useMQTT();

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
      <div className="relative min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
          <p className="text-sm text-slate-400 font-medium animate-pulse">Memuat konfigurasi...</p>
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
          />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-black w-full"
        >
          {/* Background Glowing Blobs Container */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-emerald-500/5 rounded-full blur-[120px]" />
          </div>

          {/* Main Container */}
          <div className="max-w-6xl w-full mx-auto p-4 md:p-8 flex flex-col flex-1 z-10">
            
            {/* Header Section */}
            <DashboardHeader
              isDemoMode={isDemoMode}
              connectionStatus={connectionStatus}
              deviceId={config.deviceId}
              onDisconnect={handleDisconnect}
            />

            {/* Content Body */}
            <main className="flex-1">
              {telemetry === null ? (
                /* SKELETON LOADING UI */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Skeleton Soil Card */}
                  <div className="md:col-span-2 bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl flex flex-col justify-between h-[360px]">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-36 bg-slate-800 rounded-md animate-pulse" />
                      <div className="h-6 w-24 bg-slate-800 rounded-full animate-pulse" />
                    </div>
                    <div className="flex flex-col items-center justify-center flex-1 my-4">
                      <div className="w-48 h-24 border-t-8 border-x-8 border-slate-800 rounded-t-full animate-pulse flex items-end justify-center">
                        <div className="h-6 w-16 bg-slate-800 rounded mb-2 animate-pulse" />
                      </div>
                      <div className="h-4 w-28 bg-slate-800 rounded mt-4 animate-pulse" />
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-800/60 pt-4">
                      <div className="h-4 w-24 bg-slate-800 rounded animate-pulse" />
                      <div className="h-4 w-24 bg-slate-800 rounded animate-pulse" />
                    </div>
                  </div>

                  {/* Skeleton Light and Control Cards */}
                  <div className="space-y-6 flex flex-col">
                    <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl h-[170px] flex flex-col justify-between">
                      <div className="h-4 w-28 bg-slate-800 rounded-md animate-pulse" />
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-800 rounded-full animate-pulse" />
                        <div className="space-y-2">
                          <div className="h-5 w-20 bg-slate-800 rounded animate-pulse" />
                          <div className="h-3.5 w-16 bg-slate-800 rounded animate-pulse" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl flex-1 flex flex-col justify-between min-h-[166px]">
                      <div className="h-4 w-32 bg-slate-800 rounded-md animate-pulse" />
                      <div className="space-y-3 mt-4">
                        <div className="h-8 w-full bg-slate-800 rounded-lg animate-pulse" />
                        <div className="grid grid-cols-2 gap-3">
                          <div className="h-9 bg-slate-800 rounded-lg animate-pulse" />
                          <div className="h-9 bg-slate-800 rounded-lg animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Loading message */}
                  <div className="md:col-span-3 text-center py-6">
                    <Loader2 className="w-8 h-8 text-teal-400 animate-spin mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">
                      Menunggu payload telemetry pertama dari topik <span className="font-mono text-teal-300">"{config.deviceId}/telemetry"</span>...
                    </p>
                    <button
                      onClick={handleEnterDemo}
                      className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 underline font-semibold transition cursor-pointer"
                    >
                      Aktifkan Simulator Demo untuk Memulai Instant
                    </button>
                  </div>
                </div>
              ) : (
                /* REAL DASHBOARD CONTENT */
                <div className="space-y-6">
                  {/* Grid Content */}
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start"
                  >
                    {/* Left Column (takes 2 cols on md+) */}
                    <div className="md:col-span-2 space-y-6 flex flex-col">
                      <SoilMoistureCard telemetry={telemetry} />
                      <AIAssistantCard telemetry={telemetry} />
                    </div>

                    {/* Right Column (takes 1 col on md+) */}
                    <div className="space-y-6 flex flex-col">
                      <LightSensorCard telemetry={telemetry} />
                      <ControlsCard telemetry={telemetry} publishCommand={publishCommand} />
                      <SystemSettingsCard publishCommand={publishCommand} telemetry={telemetry} otaLogs={otaLogs} clearOtaLogs={clearOtaLogs} />
                    </div>
                  </motion.div>
                </div>
              )}
            </main>

            {/* Threshold configurations & FOOTER */}
            {telemetry !== null && (
              <ThresholdSettings telemetry={telemetry} deviceId={config.deviceId} />
            )}

            <footer className="mt-12 mb-4 text-center text-[10px] text-slate-600 font-semibold tracking-wider uppercase border-t border-slate-900/60 pt-6">
              SmartPlant Dashboard &copy; {new Date().getFullYear()} • IoT Solution for Smart Gardening
            </footer>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function SmartPlantDashboard() {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
          <p className="text-sm text-slate-400 font-medium animate-pulse">Memuat dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
