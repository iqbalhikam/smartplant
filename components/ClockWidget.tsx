import React, { useState, useEffect } from 'react';
import { Clock } from "lucide-react";

export default function ClockWidget() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) {
    return (
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-xl h-full flex flex-col justify-center items-center text-white">
        <Clock className="w-8 h-8 opacity-50 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-xl h-full flex flex-col relative overflow-hidden pointer-events-auto">
      {/* Decorative circles */}
      <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-24 h-24 rounded-full bg-black/10 blur-xl"></div>
      
      <div className="flex items-center gap-2 mb-2 z-10 opacity-80 text-white">
        <Clock className="w-4 h-4" />
        <h2 className="text-xs font-semibold uppercase tracking-wider">Waktu Sistem</h2>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center z-10 text-white">
        <div className="text-4xl md:text-5xl font-bold font-mono tracking-tighter drop-shadow-md">
          {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          <span className="text-lg md:text-xl opacity-70 ml-1">
            {time.getSeconds().toString().padStart(2, '0')}
          </span>
        </div>
        <p className="text-sm font-medium mt-1 opacity-80">
          {time.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </div>
  );
}
