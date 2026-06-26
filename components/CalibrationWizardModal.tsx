import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplet, Wind, Sparkles, CheckCircle, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
import { SmartPlantData } from "../types";

interface CalibrationWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: SmartPlantData;
  publishCommand: (command: string) => void;
}

export default function CalibrationWizardModal({ isOpen, onClose, telemetry, publishCommand }: CalibrationWizardModalProps) {
  const [step, setStep] = useState(0);
  const [tempKering, setTempKering] = useState<number | null>(null);
  const [tempBasah, setTempBasah] = useState<number | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setTempKering(null);
      setTempBasah(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => setStep(s => s + 1);

  const lockDryValue = () => {
    setTempKering(telemetry?.tanah ?? 0);
    handleNext();
  };

  const lockWetValue = () => {
    const currentTanah = telemetry?.tanah ?? 0;
    if (tempKering !== null && currentTanah >= tempKering) {
      toast.error("Nilai anomali terdeteksi!", {
        description: "Nilai basah tidak boleh lebih besar dari nilai kering. Pastikan sensor tercelup di air."
      });
      return;
    }
    setTempBasah(currentTanah);
    handleNext();
  };

  const saveAndApply = () => {
    if (tempKering !== null && tempBasah !== null) {
      publishCommand(`CAL:KERING:${tempKering}`);
      // Memberi sedikit delay agar perintah MQTT tidak tertumpuk
      setTimeout(() => {
        publishCommand(`CAL:BASAH:${tempBasah}`);
        toast.success("Kalibrasi berhasil dikirim ke perangkat", {
          description: `Rentang baru: Basah (${tempBasah}) - Kering (${tempKering})`
        });
        onClose();
      }, 500);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 25 } },
    exit: { opacity: 0, scale: 0.95, y: 20 }
  };

  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop (Blur Tebal) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative w-full max-w-md bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative h-[400px]">
          <AnimatePresence mode="wait">
            {/* STEP 0: INTRO */}
            {step === 0 && (
              <motion.div
                key="step-0"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-6">
                  <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Kalibrasi Cerdas</h2>
                <p className="text-sm text-text-secondary mb-8 leading-relaxed">
                  Sesuaikan sensor dengan lingkungan nyata agar persentase kelembapan (0-100%) dan kecerdasan AI bekerja 100% akurat. Data kalibrasi akan disimpan secara permanen di dalam memori perangkat ESP32.
                </p>
                <button
                  onClick={handleNext}
                  className="w-full py-3.5 bg-primary hover:bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 transition-all active:scale-95"
                >
                  Mulai Kalibrasi
                </button>
              </motion.div>
            )}

            {/* STEP 1: KERING (UDARA) */}
            {step === 1 && (
              <motion.div
                key="step-1"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-warning/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-amber-50 dark:bg-warning/10 border-2 border-warning/30 flex items-center justify-center mb-6">
                    <Wind className="w-10 h-10 text-warning" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Langkah 1: Batas Kering</h2>
                <p className="text-xs text-text-secondary mb-6 px-4">
                  Angkat sensor dari tanah, lap perlahan hingga benar-benar kering. Biarkan di udara terbuka.
                </p>
                
                <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-6 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-2 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-warning animate-ping" />
                    Membaca Sensor...
                  </div>
                  <div className="text-5xl font-mono font-black text-text-primary">
                    {telemetry.tanah}
                  </div>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2 font-medium">Tunggu hingga angka berhenti bergerak...</p>
                </div>

                <button
                  onClick={lockDryValue}
                  className="w-full py-3.5 bg-warning hover:bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-warning/30 transition-all active:scale-95"
                >
                  Kunci Nilai Kering
                </button>
              </motion.div>
            )}

            {/* STEP 2: BASAH (AIR) */}
            {step === 2 && (
              <motion.div
                key="step-2"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-blue-50 dark:bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-6">
                    <Droplet className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Langkah 2: Batas Basah</h2>
                <p className="text-xs text-text-secondary mb-6 px-4">
                  Siapkan segelas air. Celupkan sensor ke dalam air hingga sebatas garis aman (jangan sampai kena mesin atasnya).
                </p>
                
                <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-6 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-2 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                    Membaca Sensor...
                  </div>
                  <div className="text-5xl font-mono font-black text-text-primary">
                    {telemetry.tanah}
                  </div>
                  <p className="text-[10px] text-primary dark:text-secondary mt-2 font-medium">Tunggu hingga angka stabil & turun drastis.</p>
                </div>

                <button
                  onClick={lockWetValue}
                  className="w-full py-3.5 bg-primary hover:bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 transition-all active:scale-95"
                >
                  Kunci Nilai Basah
                </button>
              </motion.div>
            )}

            {/* STEP 3: DONE */}
            {step === 3 && (
              <motion.div
                key="step-3"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-24 h-24 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center mb-6"
                >
                  <CheckCircle className="w-12 h-12 text-primary" />
                </motion.div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Berhasil Dikalibrasi!</h2>
                <p className="text-sm text-text-secondary mb-6">
                  Sensor siap digunakan dengan akurasi maksimal.
                </p>
                
                <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-8 border border-slate-200 dark:border-slate-700 flex justify-around">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Kering Maksimal</p>
                    <p className="font-mono text-lg font-bold text-warning">{tempKering}</p>
                  </div>
                  <div className="w-px bg-slate-200 dark:bg-slate-700" />
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Basah Maksimal</p>
                    <p className="font-mono text-lg font-bold text-primary">{tempBasah}</p>
                  </div>
                </div>

                <button
                  onClick={saveAndApply}
                  className="w-full py-3.5 bg-primary hover:bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 transition-all active:scale-95"
                >
                  Simpan ke Perangkat
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
