"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Cpu, Network, Sliders, Zap } from "lucide-react";
import Link from "next/link";
import ArchitectureSection from "../../components/docs/ArchitectureSection";
import FuzzyTableSection from "../../components/docs/FuzzyTableSection";
import HardwareSection from "../../components/docs/HardwareSection";
import CalibrationSection from "../../components/docs/CalibrationSection";

const TABS = [
  { id: "architecture", label: "Arsitektur Sistem", icon: Network },
  { id: "fuzzy", label: "Sistem Pakar (Fuzzy AI)", icon: Zap },
  { id: "hardware", label: "Pinout & Hardware", icon: Cpu },
  { id: "calibration", label: "Kalibrasi Dinamis", icon: Sliders },
];

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 selection:bg-teal-500/30 font-sans flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 lg:w-72 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 shrink-0 sticky top-0 md:h-screen overflow-y-auto">
        <div className="p-6">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-teal-500 dark:hover:text-teal-400 transition-colors mb-8 bg-slate-100 dark:bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/50">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Dashboard
          </Link>
          
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-teal-500/10 border border-teal-500/20 rounded-xl">
              <BookOpen className="w-6 h-6 text-teal-500" />
            </div>
            <div>
              <h1 className="font-black text-lg text-slate-900 dark:text-white">SmartPlant Docs</h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider">v1.0.0-IoT</p>
            </div>
          </div>

          <nav className="space-y-1.5 flex flex-row overflow-x-auto md:flex-col pb-2 md:pb-0">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 md:w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive 
                      ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 md:overflow-y-auto md:h-screen">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {activeTab === "architecture" && <ArchitectureSection />}
              {activeTab === "fuzzy" && <FuzzyTableSection />}
              {activeTab === "hardware" && <HardwareSection />}
              {activeTab === "calibration" && <CalibrationSection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
