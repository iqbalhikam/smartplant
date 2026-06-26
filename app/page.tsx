"use client";

import React from "react";
import { WidgetVariant } from "../types";
import { useMQTTContext } from "../components/MQTTProvider";
import SharedGridLayout from "../components/SharedGridLayout";

import SoilMoistureCard from "../components/SoilMoistureCard";
import LightSensorCard from "../components/LightSensorCard";
import ControlsCard from "../components/ControlsCard";
import AIAssistantCard from "../components/AIAssistantCard";
import AIFuzzyStatusCard from "../components/AIFuzzyStatusCard";
import HistoryCard from "../components/HistoryCard";
import ClockWidget from "../components/ClockWidget";
import PlantWaterDemandBar from "../components/PlantWaterDemandBar";
import { Loader2 } from "lucide-react";

export default function SmartPlantCareDashboard() {
  const { telemetry, publishCommand, handleEnterDemo } = useMQTTContext();

  if (telemetry === null) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
        <div className="md:col-span-3 text-center py-6">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
          <p className="text-xs text-slate-500">Memuat dashboard dan sensor...</p>
          <button
            onClick={handleEnterDemo}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 underline font-semibold mt-4"
          >
            Aktifkan Simulator Demo
          </button>
        </div>
      </div>
    );
  }

  const renderWidget = (type: string, variant?: string) => {
    const v = variant as WidgetVariant;
    switch (type) {
      case "ai-status": return <AIFuzzyStatusCard telemetry={telemetry} variant={v} />;
      case "kontrol": return <ControlsCard telemetry={telemetry} publishCommand={publishCommand} variant={v} />;
      case "riwayat": return <HistoryCard variant={v} />;
      case "ekosistem": return <SoilMoistureCard telemetry={telemetry} variant={v} />;
      case "water-demand": return <PlantWaterDemandBar telemetry={telemetry} variant={v} />;
      case "cahaya": return <LightSensorCard telemetry={telemetry} variant={v} />;
      case "ai-assistant": return <AIAssistantCard telemetry={telemetry} variant={v} />;
      case "clock": return <ClockWidget variant={v} />;
      default: return null;
    }
  };

  return <SharedGridLayout pageName="dashboard" renderWidget={renderWidget} />;
}
