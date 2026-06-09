import React, { useEffect, useRef } from "react";
import { QrCode } from "lucide-react";
import { motion } from "framer-motion";

interface QRScannerProps {
  onScanSuccess: (text: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const scannerRef = useRef<any>(null);
  const regionId = "qr-reader-element";

  useEffect(() => {
    let isMounted = true;
    let html5QrCode: any = null;

    const startScanner = async () => {
      try {
        // @ts-ignore
        const { Html5Qrcode } = await import("html5-qrcode");
        if (!isMounted) return;

        html5QrCode = new Html5Qrcode(regionId);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
          },
          (decodedText: string) => {
            onScanSuccess(decodedText);
          },
          () => {
            // Frame errors are common, ignore them
          }
        );
      } catch (err) {
        console.error("Error starting QR Code scanner:", err);
      }
    };

    const timer = setTimeout(() => {
      startScanner();
    }, 300);

    return () => {
      clearTimeout(timer);
      isMounted = false;
      if (scannerRef.current) {
        const scanner = scannerRef.current;
        if (scanner.isScanning) {
          scanner.stop().catch((err: any) => {
            console.error("Failed to stop scanner on unmount:", err);
          });
        }
      }
    };
  }, [onScanSuccess]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 15, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative"
      >
        <h3 className="text-lg font-bold text-slate-100 mb-1.5 flex items-center gap-2">
          <QrCode className="w-5 h-5 text-teal-400 animate-pulse" />
          Pindai QR Code
        </h3>
        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          Dekatkan QR Code pada kamera. Sistem akan memproses otomatis setelah kode terdeteksi.
        </p>

        <div className="relative overflow-hidden rounded-2xl bg-slate-950 border border-slate-800/80 aspect-square flex items-center justify-center">
          <div id={regionId} className="w-full h-full" />
          <div className="absolute inset-0 border-40 border-slate-950/70 pointer-events-none flex items-center justify-center">
            <div className="w-[160px] h-[160px] border-2 border-dashed border-teal-400 rounded-lg animate-pulse" />
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 hover:text-white py-3 rounded-xl text-xs font-bold tracking-wider transition-all duration-300 active:scale-95 cursor-pointer"
        >
          BATALKAN
        </button>
      </motion.div>
    </motion.div>
  );
}
