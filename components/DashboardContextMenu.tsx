"use client";

import React from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { useDeviceStore } from "../store/useDeviceStore";
import { Plus, LayoutTemplate, Lock, RotateCcw, Palette, ChevronRight } from "lucide-react";
import { WidgetVariant } from "../types";

const VARIANTS: { value: WidgetVariant; label: string }[] = [
  { value: "default", label: "Default Style" },
  { value: "minimal", label: "Minimalist" },
  { value: "glassmorphism", label: "Glassmorphism" },
  { value: "solid", label: "Solid Colors" },
  { value: "neon", label: "Neon Cyberpunk" },
  { value: "neobrutalism", label: "Neo Brutalism" },
  { value: "neumorphism", label: "Neumorphism" },
];

export default function DashboardContextMenu({ children }: { children: React.ReactNode }) {
  const { isEditMode, setIsEditMode, setIsWidgetModalOpen, resetLayout, activePage, setGlobalVariant, themeColor, setThemeColor } = useDeviceStore();

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div className="w-full h-full min-h-full">{children}</div>
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content 
          className="min-w-[220px] bg-surface rounded-lg shadow-xl border border-border p-1 z-50 text-sm"
          alignOffset={5}
        >
          <ContextMenu.Item 
            className="flex items-center gap-2 px-2 py-2 rounded-md outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            onClick={() => setIsWidgetModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Add Widget</span>
          </ContextMenu.Item>
          
          <ContextMenu.Separator className="h-px bg-slate-200 dark:bg-slate-800 my-1" />

          <ContextMenu.Sub>
            <ContextMenu.SubTrigger className="flex items-center justify-between px-2 py-2 rounded-md outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-800">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                <span>Global Theme</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent 
                className="min-w-[180px] bg-surface rounded-lg shadow-xl border border-border p-1 z-50 text-sm ml-1"
                sideOffset={2}
                alignOffset={-5}
              >
                <div className="px-2 py-1.5 text-xs font-semibold text-text-secondary">
                  Terapkan ke semua widget
                </div>
                {VARIANTS.map((v) => (
                  <ContextMenu.Item
                    key={v.value}
                    className="flex items-center gap-2 px-2 py-2 rounded-md outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                    onClick={() => setGlobalVariant(v.value)}
                  >
                    <span>{v.label}</span>
                  </ContextMenu.Item>
                ))}
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>



          <ContextMenu.Separator className="h-px bg-slate-200 dark:bg-slate-800 my-1" />

          <ContextMenu.Item 
            className="flex items-center gap-2 px-2 py-2 rounded-md outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? <Lock className="w-4 h-4" /> : <LayoutTemplate className="w-4 h-4" />}
            <span>{isEditMode ? "Lock Layout" : "Edit Layout"}</span>
          </ContextMenu.Item>

          <ContextMenu.Item 
            className="flex items-center gap-2 px-2 py-2 rounded-md outline-none cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
            onClick={() => {
              if(window.confirm("Apakah Anda yakin ingin mengatur ulang tata letak ke pengaturan awal?")) {
                resetLayout(activePage);
              }
            }}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Layout</span>
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
