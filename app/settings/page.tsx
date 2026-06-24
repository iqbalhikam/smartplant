"use client";

import React, { useState, useEffect } from "react";
import { useMQTTContext } from "../../components/MQTTProvider";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import ThresholdSettingsCard from "../../components/ThresholdSettingsCard";
import SystemSettingsCard from "../../components/SystemSettingsCard";
import PumpCalibrationCard from "../../components/PumpCalibrationCard";
import { Loader2 } from "lucide-react";

const INITIAL_CARD_ORDER = ['threshold', 'sistem', 'kalibrasi-pompa'];

const INITIAL_CARD_SIZES: Record<string, { colSpan: number, rowSpan: number }> = {
  "threshold": { colSpan: 6, rowSpan: 3 },
  "sistem": { colSpan: 6, rowSpan: 6 },
  "kalibrasi-pompa": { colSpan: 6, rowSpan: 3 },
};

// Helper for dynamic Tailwind classes (Tailwind can't purge dynamic interpolation)
const getSpanClass = (col: number, row: number) => {
  const colMap: Record<number, string> = {
    1: "col-span-1", 2: "col-span-2", 3: "col-span-3", 4: "col-span-4",
    5: "col-span-5", 6: "col-span-6", 7: "col-span-7", 8: "col-span-8",
    9: "col-span-9", 10: "col-span-10", 11: "col-span-11", 12: "col-span-12"
  };
  const rowMap: Record<number, string> = {
    1: "row-span-1", 2: "row-span-2", 3: "row-span-3", 4: "row-span-4",
    5: "row-span-5", 6: "row-span-6", 7: "row-span-7", 8: "row-span-8"
  };
  return `${colMap[col] || "col-span-6"} ${rowMap[row] || "row-span-4"}`;
};

function SortableItem({ id, isEditMode, children, colSpan, rowSpan, onResize }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  const spanClass = getSpanClass(colSpan, rowSpan);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${spanClass} sortable-item ${isDragging ? 'sortable-item-dragging' : ''} h-full min-h-0 flex flex-col relative`}
      {...attributes}
      {...listeners}
    >
      <div className={`w-full h-full min-h-0 flex flex-col ${isDragging ? 'pointer-events-none' : ''}`}>
        {children}
      </div>

      {/* Resize Overlay Controls */}
      {isEditMode && (
        <div 
          className="absolute bottom-2 right-2 flex gap-1 z-100 pointer-events-auto"
          onPointerDown={(e) => e.stopPropagation()} // Cegah event drag saat klik tombol
          onClick={(e) => e.stopPropagation()} // Cegah Edit Mode tertutup saat resize
        >
          <div className="flex bg-slate-900/80 backdrop-blur rounded-lg p-1 text-white text-xs gap-1 border border-white/20 shadow-xl items-center">
            <span className="flex items-center gap-0.5 border-r border-white/20 pr-1">
              <span className="opacity-70 px-0.5 font-bold">W</span>
              <button 
                onClick={() => onResize(id, -1, 0)} 
                className="hover:bg-white/20 rounded px-1.5 py-0.5 disabled:opacity-30 transition-colors" 
                disabled={colSpan <= 2}
              >-</button>
              <button 
                onClick={() => onResize(id, 1, 0)} 
                className="hover:bg-white/20 rounded px-1.5 py-0.5 disabled:opacity-30 transition-colors" 
                disabled={colSpan >= 12}
              >+</button>
            </span>
            <span className="flex items-center gap-0.5 pl-0.5">
              <span className="opacity-70 px-0.5 font-bold">H</span>
              <button 
                onClick={() => onResize(id, 0, -1)} 
                className="hover:bg-white/20 rounded px-1.5 py-0.5 disabled:opacity-30 transition-colors" 
                disabled={rowSpan <= 2}
              >-</button>
              <button 
                onClick={() => onResize(id, 0, 1)} 
                className="hover:bg-white/20 rounded px-1.5 py-0.5 disabled:opacity-30 transition-colors" 
                disabled={rowSpan >= 8}
              >+</button>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { telemetry, config, publishCommand, otaLogs, clearOtaLogs } = useMQTTContext();
  const [isMounted, setIsMounted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [cardOrder, setCardOrder] = useState<string[]>(INITIAL_CARD_ORDER);
  const [cardSizes, setCardSizes] = useState(INITIAL_CARD_SIZES);

  useEffect(() => {
    setIsMounted(true);
    
    // Load Order
    const savedOrder = localStorage.getItem("smartplant-settings-order");
    if (savedOrder) {
      try { setCardOrder(JSON.parse(savedOrder)); } catch (e) {}
    }
    
    // Load Sizes
    const savedSizes = localStorage.getItem("smartplant-settings-sizes");
    if (savedSizes) {
      try { 
        const parsedSizes = JSON.parse(savedSizes);
        // Migration: Fix the broken default sizes (rowSpan 4 -> 3)
        if (parsedSizes["threshold"]?.rowSpan === 4) {
          parsedSizes["threshold"].rowSpan = 3;
          parsedSizes["kalibrasi-pompa"].rowSpan = 3;
          localStorage.setItem("smartplant-settings-sizes", JSON.stringify(parsedSizes));
        }
        setCardSizes(parsedSizes); 
      } catch (e) {}
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isEditMode) {
      setIsEditMode(true);
      toast.success("Mode Tata Letak Aktif. Drag atau Resize untuk menyesuaikan layar.", { duration: 3000 });
    }
  };

  const handleClickOutside = () => {
    if (isEditMode) {
      setIsEditMode(false);
      toast.info("Tata Letak Terkunci", { duration: 2000 });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCardOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem("smartplant-settings-order", JSON.stringify(newOrder));
        return newOrder;
      });
    }
  };

  const handleResize = (id: string, colDelta: number, rowDelta: number) => {
    setCardSizes((prev) => {
      const current = prev[id] || INITIAL_CARD_SIZES[id] || { colSpan: 6, rowSpan: 4 };
      let newCol = current.colSpan + colDelta;
      let newRow = current.rowSpan + rowDelta;
      
      if (newCol < 2) newCol = 2;
      if (newCol > 12) newCol = 12;
      if (newRow < 2) newRow = 2;
      if (newRow > 8) newRow = 8;
      
      const nextSizes = { ...prev, [id]: { colSpan: newCol, rowSpan: newRow } };
      localStorage.setItem("smartplant-settings-sizes", JSON.stringify(nextSizes));
      return nextSizes;
    });
  };

  if (!isMounted || telemetry === null) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        <div className="md:col-span-2 text-center py-6">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
          <p className="text-xs text-slate-500">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`w-full h-[calc(100vh-4rem)] p-4 overflow-y-auto overflow-x-hidden ${isEditMode ? "edit-mode" : ""}`}
      onContextMenu={handleContextMenu}
      onClick={handleClickOutside}
    >
      <div className="grid grid-cols-12 grid-rows-[repeat(6,minmax(115px,1fr))] auto-rows-[minmax(115px,1fr)] grid-flow-dense gap-3 w-full min-h-full">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={cardOrder}
            strategy={rectSortingStrategy}
          >
            {cardOrder.map((id) => {
              const sizes = cardSizes[id] || INITIAL_CARD_SIZES[id] || { colSpan: 6, rowSpan: 4 };

              return (
                <SortableItem 
                  key={id} 
                  id={id} 
                  isEditMode={isEditMode} 
                  colSpan={sizes.colSpan}
                  rowSpan={sizes.rowSpan}
                  onResize={handleResize}
                >
                  {id === "threshold" && <ThresholdSettingsCard telemetry={telemetry} deviceId={config.deviceId} publishCommand={publishCommand} />}
                  {id === "sistem" && <SystemSettingsCard publishCommand={publishCommand} telemetry={telemetry} otaLogs={otaLogs} clearOtaLogs={clearOtaLogs} />}
                  {id === "kalibrasi-pompa" && <PumpCalibrationCard telemetry={telemetry} publishCommand={publishCommand} />}
                </SortableItem>
              );
            })}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
