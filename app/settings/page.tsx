"use client";

import React from "react";
import { WidgetVariant } from "../../types";
import { useMQTTContext } from "../../components/MQTTProvider";
import SharedGridLayout from "../../components/SharedGridLayout";

import ThresholdSettingsCard from "../../components/ThresholdSettingsCard";
import SystemSettingsCard from "../../components/SystemSettingsCard";
import PumpCalibrationCard from "../../components/PumpCalibrationCard";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { telemetry, config, publishCommand, otaLogs, clearOtaLogs } = useMQTTContext();

  if (telemetry === null) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        <div className="md:col-span-2 text-center py-6">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
          <p className="text-xs text-slate-500">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  const renderWidget = (type: string, variant?: string) => {
    const v = variant as WidgetVariant;
    switch (type) {
      case "threshold": 
        return <ThresholdSettingsCard telemetry={telemetry} deviceId={config.deviceId} publishCommand={publishCommand} variant={v} />;
      case "sistem": 
        return <SystemSettingsCard publishCommand={publishCommand} telemetry={telemetry} otaLogs={otaLogs} clearOtaLogs={clearOtaLogs} variant={v} />;
      case "kalibrasi-pompa": 
        return <PumpCalibrationCard telemetry={telemetry} publishCommand={publishCommand} variant={v} />;
      default: 
        return null;
    }
  };

  return <SharedGridLayout pageName="settings" renderWidget={renderWidget} />;
}
