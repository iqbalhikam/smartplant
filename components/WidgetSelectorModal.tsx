"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useDeviceStore } from "../store/useDeviceStore";
import { X, Plus, Check } from "lucide-react";
import { WidgetVariant } from "../types";

const AVAILABLE_WIDGETS: Record<string, { type: string, name: string, desc: string, variants?: WidgetVariant[] }[]> = {
  dashboard: [
    { type: "ai-status", name: "AI Status", desc: "Menampilkan status fuzzy AI", variants: ['default'] },
    { type: "kontrol", name: "Kontrol Pompa", desc: "Kendali pompa dan aktuator", variants: ['default'] },
    { type: "riwayat", name: "Riwayat", desc: "Grafik riwayat sensor", variants: ['default'] },
    { type: "ekosistem", name: "Kelembapan Tanah", desc: "Status kelembapan tanah", variants: ['default', 'minimal', 'glassmorphism'] },
    { type: "water-demand", name: "Plant Water Demand", desc: "Status kebutuhan air relatif", variants: ['default', 'glassmorphism'] },
    { type: "cahaya", name: "Sensor Suhu & Cahaya", desc: "Suhu udara dan cahaya", variants: ['default', 'minimal', 'glassmorphism'] },
    { type: "clock", name: "Jam Digital", desc: "Waktu sistem saat ini", variants: ['default'] },
    { type: "ai-assistant", name: "AI Assistant", desc: "Chatbot AI", variants: ['default'] },
  ],
  settings: [
    { type: "threshold", name: "Batas Sensor (Threshold)", desc: "Pengaturan batas sensor", variants: ['default'] },
    { type: "sistem", name: "Pengaturan Sistem", desc: "Pengaturan sistem dan OTA", variants: ['default'] },
    { type: "kalibrasi-pompa", name: "Kalibrasi Pompa", desc: "Pengaturan kalibrasi pompa", variants: ['default'] },
  ],
  history: [
    { type: "history-sensor", name: "Riwayat Sensor", desc: "Grafik dan tabel sensor", variants: ['default'] },
    { type: "history-action", name: "Riwayat Keputusan", desc: "Grafik dan tabel keputusan", variants: ['default'] },
  ]
};

const VARIANT_LABELS: Record<string, string> = {
  'default': 'Original Design',
  'minimal': 'Minimalist Clean',
  'glassmorphism': 'Frosted Glass',
  'gauge': 'Gauge Meter'
};

interface WidgetSelectorModalProps {
  renderWidget?: (type: string, variant?: string) => React.ReactNode;
}

export default function WidgetSelectorModal({ renderWidget }: WidgetSelectorModalProps) {
  const { isWidgetModalOpen, setIsWidgetModalOpen, activePage, addWidget, layouts } = useDeviceStore();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleAddWidget = (type: string, variant: string) => {
    let w = 4;
    let h = 4; // Default standard size
    if (type === "ekosistem") { w = 5; h = 8; }
    else if (type === "riwayat") { w = 5; h = 7; }
    else if (type === "water-demand") { w = 5; h = 4; }
    else if (type === "ai-status") { w = 4; h = 4; }
    else if (type === "kontrol") { w = 4; h = 11; }
    else if (type === "ai-assistant" || type === "cahaya" || type === "clock") { w = 3; h = 5; }
    else if (type === "threshold" || type === "kalibrasi-pompa") { w = 6; h = 4; }
    else if (type === "sistem") { w = 12; h = 6; }
    else if (type === "history-sensor" || type === "history-action") { w = 6; h = 10; }

    addWidget(activePage, type, variant, 0, Infinity, w, h);
    setIsWidgetModalOpen(false);
  };

  const widgetsList = AVAILABLE_WIDGETS[activePage] || [];
  const selectedWidgetDef = widgetsList.find(w => w.type === selectedType) || widgetsList[0];
  const activeLayouts = layouts[activePage] || [];

  // Set default selected if not set
  if (isWidgetModalOpen && !selectedType && widgetsList.length > 0) {
    setSelectedType(widgetsList[0].type);
  }

  // Handle open state change to clear selection
  const handleOpenChange = (open: boolean) => {
    setIsWidgetModalOpen(open);
    if (!open) setSelectedType(null);
  };

  return (
    <Dialog.Root open={isWidgetModalOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100" />
        <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[90vh] w-[95vw] max-w-5xl translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-background p-0 shadow-2xl focus:outline-none z-100 border border-border flex overflow-hidden">
          
          {/* Left Column: Widget List */}
          <div className="w-1/3 min-w-[250px] max-w-[300px] bg-surface border-r border-border flex flex-col">
            <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <Dialog.Title className="text-xl font-bold text-slate-800 dark:text-white m-0">
                Add Widget
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-text-secondary">
                Pilih sensor atau fungsi yang ingin ditambahkan ke {activePage}.
              </Dialog.Description>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {widgetsList.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">Tidak ada widget.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {widgetsList.map((widget) => {
                    const isSelected = selectedType === widget.type;
                    return (
                      <button
                        key={widget.type}
                        onClick={() => setSelectedType(widget.type)}
                        className={`text-left p-3 rounded-xl transition-all border ${isSelected ? 'bg-indigo-50 border-indigo-200 dark:bg-primary/10 dark:border-primary/30 ring-1 ring-primary' : 'bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                      >
                        <h4 className={`font-semibold text-sm ${isSelected ? 'text-indigo-700 dark:text-secondary' : 'text-slate-700 dark:text-slate-200'}`}>
                          {widget.name}
                        </h4>
                        <p className="text-[10px] text-text-secondary mt-1 line-clamp-1">{widget.desc}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Variant Live Preview */}
          <div className="flex-1 flex flex-col bg-slate-100/50 dark:bg-background/50 overflow-hidden relative">
            <div className="p-6 pb-4 shrink-0 border-b border-slate-200/50 dark:border-slate-800/50 bg-surface backdrop-blur-md">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                Pilih Tema Visual
                <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-text-secondary text-[10px] uppercase tracking-wider">
                  {selectedWidgetDef?.name}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">Preview menunjukkan data real-time sensor. Tambahkan variasi desain yang belum ada di dashboard.</p>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
              {selectedWidgetDef ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
                  {(selectedWidgetDef.variants || ['default']).map(variant => {
                    // Cek duplikasi: Apakah tipe & varian ini sudah ada di layout page ini?
                    const isAdded = activeLayouts.some(w => w.type === selectedType && (w.variant || 'default') === variant);
                    
                    return (
                      <div key={variant} className={`flex flex-col bg-surface rounded-2xl border ${isAdded ? 'border-border opacity-80' : 'border-indigo-100 dark:border-indigo-900/40 hover:border-secondary dark:hover:border-primary/60 shadow-sm hover:shadow-md'} overflow-hidden transition-all group`}>
                        {/* Header */}
                        <div className="flex justify-between items-center p-3 px-4 border-b border-slate-100 dark:border-slate-800 bg-background shrink-0">
                          <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                            {VARIANT_LABELS[variant] || variant}
                          </span>
                          {isAdded ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-primary dark:text-secondary bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                              <Check className="w-3 h-3" /> ACTIVE
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAddWidget(selectedType!, variant)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-primary hover:bg-indigo-700 rounded-full transition-colors shadow-sm group-hover:ring-2 ring-primary/30"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add to Layout
                            </button>
                          )}
                        </div>
                        
                        {/* Live Preview Container (Scaled) */}
                        <div className="h-[260px] relative bg-slate-100 dark:bg-background/80 overflow-hidden flex items-center justify-center p-4">
                           {/* Background Pattern */}
                           <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
                           
                           {/* Scaled Wrapper */}
                           <div className="w-[150%] h-[150%] origin-center scale-[0.65] flex items-center justify-center pointer-events-none">
                              {renderWidget ? (
                                <div className="w-full max-w-sm h-full max-h-[400px]">
                                   {renderWidget(selectedType!, variant)}
                                </div>
                              ) : (
                                <div className="text-sm text-slate-400">Preview not available</div>
                              )}
                           </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  Pilih widget dari daftar di sebelah kiri
                </div>
              )}
            </div>
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 inline-flex h-8 w-8 appearance-none items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none z-10"
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
