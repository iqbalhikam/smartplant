"use client";

import React from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { useDeviceStore } from "../store/useDeviceStore";
import { Plus, LayoutTemplate, Lock, RotateCcw } from "lucide-react";

export default function DashboardContextMenu({ children }: { children: React.ReactNode }) {
  const { isEditMode, setIsEditMode, setIsWidgetModalOpen, resetLayout, activePage } = useDeviceStore();

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div className="w-full h-full min-h-full">{children}</div>
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content 
          className="min-w-[220px] bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 p-1 z-50 text-sm"
          alignOffset={5}
        >
          <ContextMenu.Item 
            className="flex items-center gap-2 px-2 py-2 rounded-md outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            onClick={() => setIsWidgetModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Add Widget</span>
          </ContextMenu.Item>
          
          <ContextMenu.Separator className="h-[1px] bg-slate-200 dark:bg-slate-800 my-1" />

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
