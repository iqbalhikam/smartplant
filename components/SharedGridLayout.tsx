"use client";

import React, { useState, useEffect } from "react";
import { useDeviceStore } from "../store/useDeviceStore";
import DashboardContextMenu from "./DashboardContextMenu";
import WidgetContextMenu from "./WidgetContextMenu";
import WidgetSelectorModal from "./WidgetSelectorModal";
import { Loader2, GripHorizontal } from "lucide-react";

// @ts-ignore
import { Responsive, WidthProvider } from "react-grid-layout/legacy";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface SharedGridLayoutProps {
  pageName: string;
  renderWidget: (type: string) => React.ReactNode;
}

export default function SharedGridLayout({ pageName, renderWidget }: SharedGridLayoutProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { layouts, isEditMode, updateLayout, setActivePage } = useDeviceStore();

  useEffect(() => {
    setIsMounted(true);
    setActivePage(pageName);
  }, [pageName, setActivePage]);

  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 gap-6 p-4">
        <div className="text-center py-6">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
          <p className="text-xs text-slate-500">Memuat antarmuka...</p>
        </div>
      </div>
    );
  }

  const widgets = layouts[pageName] || [];
  const layoutItems = widgets.map(w => ({ i: w.id, x: w.x, y: w.y, w: w.w, h: w.h, minW: 2, minH: 2 }));

  const handleLayoutChange = (currentLayout: any) => {
    updateLayout(pageName, currentLayout);
  };

  return (
    <DashboardContextMenu>
      <div 
        className={`w-full h-[calc(100vh-4rem)] p-4 overflow-y-auto overflow-x-hidden ${isEditMode ? "bg-slate-50/50 dark:bg-slate-900/50" : ""}`}
      >
        {isEditMode && (
          <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg flex items-center justify-between">
            <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">Mode Tata Letak Aktif. Anda dapat menggeser dan mengubah ukuran widget.</p>
          </div>
        )}

        {widgets.length === 0 && !isEditMode && (
          <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
            <p>Belum ada widget. Klik kanan dan pilih Tambah Widget.</p>
          </div>
        )}

        <ResponsiveGridLayout
          className={`layout ${isEditMode ? 'is-editing' : ''}`}
          layouts={{ lg: layoutItems }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={50}
          onLayoutChange={handleLayoutChange}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          draggableHandle=".drag-handle"
          margin={[16, 16]}
          useCSSTransforms={true}
        >
          {widgets.map((widget) => (
            <div 
              key={widget.id} 
              className={`h-full min-h-0 flex flex-col relative bg-transparent ${isEditMode ? "ring-2 ring-indigo-400 border-dashed border-2 border-transparent rounded-2xl" : ""}`}
            >
              <WidgetContextMenu widgetId={widget.id}>
                {/* Drag Handle */}
                {isEditMode && (
                  <div className="drag-handle absolute top-2 right-2 p-1.5 bg-slate-800/80 backdrop-blur rounded-lg text-white z-[100] cursor-grab hover:bg-slate-700 active:cursor-grabbing border border-white/20 shadow-xl">
                    <GripHorizontal className="w-4 h-4" />
                  </div>
                )}
                
                <div className="w-full h-full min-h-0 flex flex-col pointer-events-auto">
                  {renderWidget(widget.type)}
                </div>
              </WidgetContextMenu>
            </div>
          ))}
        </ResponsiveGridLayout>

        <WidgetSelectorModal />
      </div>
    </DashboardContextMenu>
  );
}
