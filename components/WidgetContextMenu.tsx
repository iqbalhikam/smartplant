"use client";

import React from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { useDeviceStore } from "../store/useDeviceStore";
import { LayoutTemplate, Trash2, Lock, Palette } from "lucide-react";

export default function WidgetContextMenu({ widgetId, children }: { widgetId: string, children: React.ReactNode }) {
  const { isEditMode, setIsEditMode, removeWidget, activePage, updateWidgetVariant } = useDeviceStore();

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div className="w-full h-full min-h-0 flex flex-col">{children}</div>
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content 
          className="min-w-[200px] bg-surface rounded-lg shadow-xl border border-border p-1 z-[100] text-sm"
          alignOffset={5}
        >
          <ContextMenu.Item 
            className="flex items-center gap-2 px-2 py-2 rounded-md outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditMode(!isEditMode);
            }}
          >
            {isEditMode ? <Lock className="w-4 h-4" /> : <LayoutTemplate className="w-4 h-4" />}
            <span>{isEditMode ? "Lock Layout" : "Edit Layout"}</span>
          </ContextMenu.Item>
          
          <ContextMenu.Separator className="h-[1px] bg-slate-200 dark:bg-slate-800 my-1" />

          <ContextMenu.Sub>
            <ContextMenu.SubTrigger className="flex items-center gap-2 px-2 py-2 rounded-md outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200">
              <Palette className="w-4 h-4" />
              <span>Gaya Widget</span>
            </ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent 
                className="min-w-[150px] bg-surface rounded-lg shadow-xl border border-border p-1 z-[100] text-sm"
                alignOffset={-5}
              >
                <ContextMenu.Item 
                  className="px-2 py-2 rounded-md outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  onClick={() => updateWidgetVariant(activePage, widgetId, "default")}
                >
                  Default
                </ContextMenu.Item>
                <ContextMenu.Item 
                  className="px-2 py-2 rounded-md outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  onClick={() => updateWidgetVariant(activePage, widgetId, "minimal")}
                >
                  Minimal
                </ContextMenu.Item>
                <ContextMenu.Item 
                  className="px-2 py-2 rounded-md outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  onClick={() => updateWidgetVariant(activePage, widgetId, "glassmorphism")}
                >
                  Glassmorphism
                </ContextMenu.Item>
                <ContextMenu.Item 
                  className="px-2 py-2 rounded-md outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  onClick={() => updateWidgetVariant(activePage, widgetId, "solid")}
                >
                  Solid Color
                </ContextMenu.Item>
                <ContextMenu.Item 
                  className="px-2 py-2 rounded-md outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  onClick={() => updateWidgetVariant(activePage, widgetId, "neon")}
                >
                  Neon Cyberpunk
                </ContextMenu.Item>
                <ContextMenu.Item 
                  className="px-2 py-2 rounded-md outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  onClick={() => updateWidgetVariant(activePage, widgetId, "neobrutalism")}
                >
                  Neobrutalism
                </ContextMenu.Item>
                <ContextMenu.Item 
                  className="px-2 py-2 rounded-md outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  onClick={() => updateWidgetVariant(activePage, widgetId, "neumorphism")}
                >
                  Neumorphism
                </ContextMenu.Item>
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>

          <ContextMenu.Separator className="h-[1px] bg-slate-200 dark:bg-slate-800 my-1" />

          <ContextMenu.Item 
            className="flex items-center gap-2 px-2 py-2 rounded-md outline-none cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              removeWidget(activePage, widgetId);
            }}
          >
            <Trash2 className="w-4 h-4" />
            <span>Remove Widget</span>
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
