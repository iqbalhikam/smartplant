"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Pengaturan", path: "/settings", icon: Settings },
  ];

  return (
    <nav className="flex items-center gap-2 mb-6 bg-white/50 dark:bg-slate-900/50 p-1.5 rounded-2xl backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 w-fit">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        const Icon = item.icon;

        return (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              isActive
                ? "bg-teal-500 text-white shadow-md shadow-teal-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Icon className="w-4 h-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
