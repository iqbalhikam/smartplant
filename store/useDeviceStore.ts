import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WidgetLayout {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface DeviceStore {
  activeDeviceId: string | null;
  setActiveDeviceId: (id: string | null) => void;

  isEditMode: boolean;
  setIsEditMode: (mode: boolean) => void;

  isWidgetModalOpen: boolean;
  setIsWidgetModalOpen: (isOpen: boolean) => void;

  // Active page to determine which layout to edit/view contextually if needed
  activePage: string;
  setActivePage: (page: string) => void;

  layouts: Record<string, WidgetLayout[]>;
  addWidget: (page: string, type: string, x?: number, y?: number, w?: number, h?: number) => void;
  removeWidget: (page: string, id: string) => void;
  updateLayout: (page: string, layout: { i: string; x: number; y: number; w: number; h: number }[]) => void;
}

const DEFAULT_LAYOUTS: Record<string, WidgetLayout[]> = {
  dashboard: [
    // Left Column
    { id: 'ekosistem-1', type: 'ekosistem', x: 0, y: 0, w: 5, h: 8 },
    { id: 'riwayat-1', type: 'riwayat', x: 0, y: 8, w: 5, h: 7 },
    
    // Middle Column
    { id: 'ai-status-1', type: 'ai-status', x: 5, y: 0, w: 4, h: 4 },
    { id: 'kontrol-1', type: 'kontrol', x: 5, y: 4, w: 4, h: 11 },
    
    // Right Column
    { id: 'ai-assistant-1', type: 'ai-assistant', x: 9, y: 0, w: 3, h: 5 },
    { id: 'cahaya-1', type: 'cahaya', x: 9, y: 5, w: 3, h: 5 },
    { id: 'clock-1', type: 'clock', x: 9, y: 10, w: 3, h: 5 },
  ],
  settings: [
    { id: 'threshold-1', type: 'threshold', x: 0, y: 0, w: 6, h: 4 },
    { id: 'kalibrasi-pompa-1', type: 'kalibrasi-pompa', x: 6, y: 0, w: 6, h: 4 },
    { id: 'sistem-1', type: 'sistem', x: 0, y: 4, w: 12, h: 6 },
  ],
  history: [
    { id: 'history-sensor-1', type: 'history-sensor', x: 0, y: 0, w: 6, h: 10 },
    { id: 'history-action-1', type: 'history-action', x: 6, y: 0, w: 6, h: 10 },
  ]
};

export const useDeviceStore = create<DeviceStore>()(
  persist(
    (set) => ({
      activeDeviceId: null,
      setActiveDeviceId: (id) => set({ activeDeviceId: id }),

      isEditMode: false,
      setIsEditMode: (mode) => set({ isEditMode: mode }),

      isWidgetModalOpen: false,
      setIsWidgetModalOpen: (isOpen) => set({ isWidgetModalOpen: isOpen }),

      activePage: "dashboard",
      setActivePage: (page) => set({ activePage: page }),

      layouts: DEFAULT_LAYOUTS,
      
      addWidget: (page, type, x = 0, y = Infinity, w = 4, h = 2) => set((state) => {
        const id = `${type}-${Date.now()}`;
        const pageLayout = state.layouts[page] || [];
        return {
          layouts: {
            ...state.layouts,
            [page]: [...pageLayout, { id, type, x, y, w, h }]
          }
        };
      }),
      
      removeWidget: (page, id) => set((state) => {
        const pageLayout = state.layouts[page] || [];
        return {
          layouts: {
            ...state.layouts,
            [page]: pageLayout.filter(w => w.id !== id)
          }
        };
      }),
      
      updateLayout: (page, layout) => set((state) => {
        const pageLayout = state.layouts[page] || [];
        const newWidgets = pageLayout.map(widget => {
          const updated = layout.find(l => l.i === widget.id);
          if (updated) {
            return { ...widget, x: updated.x, y: updated.y, w: updated.w, h: updated.h };
          }
          return widget;
        });
        return {
          layouts: {
            ...state.layouts,
            [page]: newWidgets
          }
        };
      })
    }),
    {
      name: "smartplant-dashboard-storage",
      version: 5, // version bump to apply exact user requested default layout
    }
  )
);
