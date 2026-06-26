"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, Loader2, Cpu } from "lucide-react";
import { useDeviceStore } from "../store/useDeviceStore";

interface Device {
  id: string;
  namaAlias: string;
  status: string;
}

export default function DeviceSelector() {
  const { activeDeviceId, setActiveDeviceId } = useDeviceStore();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch("/api/devices")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDevices(data.data);
          // If no active device but we have devices, select the first one
          if (!activeDeviceId && data.data.length > 0) {
            setActiveDeviceId(data.data[0].id);
          }
        }
      })
      .catch((err) => console.error("Failed to fetch devices:", err))
      .finally(() => setIsLoading(false));
  }, [activeDeviceId, setActiveDeviceId]);

  const activeDevice = devices.find((d) => d.id === activeDeviceId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/50">
        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        <span className="text-xs text-slate-500 font-medium">Memuat Alat...</span>
      </div>
    );
  }

  if (devices.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl text-sm font-semibold transition-all duration-300 border border-primary/20 bg-primary/10 text-primary dark:text-secondary hover:bg-primary/20 active:scale-95 cursor-pointer backdrop-blur-md"
      >
        <Cpu className="w-4 h-4" />
        <span className="hidden sm:inline-block truncate max-w-[120px]">
          {activeDevice ? activeDevice.namaAlias : "Pilih Alat"}
        </span>
        <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden backdrop-blur-xl">
            <div className="max-h-60 overflow-y-auto p-1">
              {devices.map((device) => (
                <button
                  key={device.id}
                  onClick={() => {
                    setActiveDeviceId(device.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeDeviceId === device.id
                      ? "bg-primary/10 text-primary dark:text-secondary font-semibold"
                      : "text-text-primary hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{device.namaAlias}</span>
                    {device.status === "ONLINE" && (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{device.id}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
