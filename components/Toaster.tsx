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
          toast: "flex flex-col gap-1 w-full bg-surface border border-border text-text-primary rounded-2xl shadow-xl shadow-primary/5 dark:shadow-primary/10 font-sans tracking-wide p-4",
          title: "font-semibold text-sm",
          description: "text-text-secondary text-xs",
          success: "border-primary/20 dark:border-primary/20 bg-primary/5 dark:bg-primary/5 text-emerald-700 dark:text-secondary",
          error: "border-danger/20 dark:border-danger/20 bg-danger/5 dark:bg-danger/5 text-rose-700 dark:text-rose-400",
          warning: "border-warning/20 dark:border-warning/20 bg-warning/5 dark:bg-warning/5 text-amber-700 dark:text-amber-400",
          info: "border-primary/20 dark:border-primary/20 bg-primary/5 dark:bg-primary/5 text-indigo-700 dark:text-secondary",
        }
      }}
    />
  );
}
