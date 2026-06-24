"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useDeviceStore } from "../store/useDeviceStore";
import { X, Plus } from "lucide-react";

const AVAILABLE_WIDGETS: Record<string, { type: string, name: string, desc: string }[]> = {
  dashboard: [
    { type: "ai-status", name: "AI Status", desc: "Menampilkan status fuzzy AI" },
    { type: "kontrol", name: "Kontrol Pompa", desc: "Kendali pompa dan aktuator" },
    { type: "riwayat", name: "Riwayat", desc: "Grafik riwayat sensor" },
    { type: "ekosistem", name: "Kelembapan Tanah", desc: "Status kelembapan tanah" },
    { type: "cahaya", name: "Sensor Cahaya", desc: "Intensitas cahaya (Lux)" },
    { type: "clock", name: "Jam Digital", desc: "Waktu sistem saat ini" },
    { type: "ai-assistant", name: "AI Assistant", desc: "Chatbot AI" },
  ],
  settings: [
    { type: "threshold", name: "Batas Sensor (Threshold)", desc: "Pengaturan batas sensor" },
    { type: "sistem", name: "Pengaturan Sistem", desc: "Pengaturan sistem dan OTA" },
    { type: "kalibrasi-pompa", name: "Kalibrasi Pompa", desc: "Pengaturan kalibrasi pompa" },
  ],
  history: [
    { type: "history-sensor", name: "Riwayat Sensor", desc: "Grafik dan tabel sensor" },
    { type: "history-action", name: "Riwayat Keputusan", desc: "Grafik dan tabel keputusan" },
  ]
};

export default function WidgetSelectorModal() {
  const { isWidgetModalOpen, setIsWidgetModalOpen, activePage, addWidget } = useDeviceStore();

  const handleAddWidget = (type: string) => {
    let w = 4;
    let h = 4; // Default standard size
    if (type === "ekosistem") { w = 5; h = 8; }
    else if (type === "riwayat") { w = 5; h = 7; }
    else if (type === "ai-status") { w = 4; h = 4; }
    else if (type === "kontrol") { w = 4; h = 11; }
    else if (type === "ai-assistant" || type === "cahaya" || type === "clock") { w = 3; h = 5; }
    else if (type === "threshold" || type === "kalibrasi-pompa") { w = 6; h = 4; }
    else if (type === "sistem") { w = 12; h = 6; }
    else if (type === "history-sensor" || type === "history-action") { w = 6; h = 10; }

    addWidget(activePage, type, 0, Infinity, w, h);
    setIsWidgetModalOpen(false);
  };

  const widgetsList = AVAILABLE_WIDGETS[activePage] || [];

  return (
    <Dialog.Root open={isWidgetModalOpen} onOpenChange={setIsWidgetModalOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" />
        <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white dark:bg-slate-900 p-6 shadow-2xl focus:outline-none z-[101] border border-slate-200 dark:border-slate-800 flex flex-col">
          <Dialog.Title className="text-xl font-semibold text-slate-800 dark:text-white m-0">
            Add Widget
          </Dialog.Title>
          <Dialog.Description className="mt-2 mb-5 text-sm text-slate-500 dark:text-slate-400">
            Pilih widget untuk ditambahkan ke layar {activePage} Anda.
          </Dialog.Description>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {widgetsList.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Tidak ada widget yang tersedia untuk halaman ini.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {widgetsList.map((widget) => (
                  <div 
                    key={widget.type}
                    className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all cursor-pointer group"
                    onClick={() => handleAddWidget(widget.type)}
                  >
                    <div>
                      <h4 className="font-medium text-slate-800 dark:text-slate-200">{widget.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{widget.desc}</p>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 inline-flex h-8 w-8 appearance-none items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
