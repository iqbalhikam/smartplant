"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";

export function Toaster() {
  const { theme = "system" } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <SonnerToaster 
      position="bottom-right" 
      theme={theme as "light" | "dark" | "system"}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "flex flex-col gap-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl shadow-xl shadow-teal-500/5 dark:shadow-teal-500/10 font-sans tracking-wide p-4",
          title: "font-semibold text-sm",
          description: "text-slate-500 dark:text-slate-400 text-xs",
          success: "border-emerald-500/20 dark:border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
          error: "border-rose-500/20 dark:border-rose-500/20 bg-rose-500/5 dark:bg-rose-500/5 text-rose-700 dark:text-rose-400",
          warning: "border-amber-500/20 dark:border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/5 text-amber-700 dark:text-amber-400",
          info: "border-indigo-500/20 dark:border-indigo-500/20 bg-indigo-500/5 dark:bg-indigo-500/5 text-indigo-700 dark:text-indigo-400",
        }
      }}
    />
  );
}
