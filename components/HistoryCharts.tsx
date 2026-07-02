"use client";

import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, ReferenceArea } from 'recharts';

// Helper function to extract active time ranges from data
function getActiveRanges(data: any[], key: string) {
  const ranges: { start: string; end: string }[] = [];
  let start: string | null = null;
  
  if (!data || !Array.isArray(data)) return ranges;

  for (let i = 0; i < data.length; i++) {
    const val = data[i][key];
    // Pastikan menangkap format data 1 (number), "1" (string), true (boolean), atau "ON" (string)
    const isActive = val === 1 || val === "1" || val === true || val === "ON" || val === "true";
    
    if (isActive && start === null) {
      start = data[i].createdAt; // Use unique createdAt
    } else if (!isActive && start !== null) {
      ranges.push({ start, end: data[i].createdAt }); // Use unique createdAt
      start = null;
    }
  }
  
  // Jika sampai akhir data status masih aktif, tutup dengan waktu terakhir
  if (start !== null && data.length > 0) {
    ranges.push({ start, end: data[data.length - 1].createdAt }); // Use unique createdAt
  }
  
  return ranges;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-800 p-3 rounded-lg shadow-xl text-xs text-white outline-none">
        <p className="font-semibold mb-2 text-slate-300">
          {new Date(label).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
        </p>
        <div className="flex flex-col gap-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center gap-6">
              <span style={{ color: entry.color }}>{entry.name} :</span>
              <span className="font-bold">{entry.value}</span>
            </div>
          ))}
          
          {(data.pompa === 'ON' || data.lampu === 'ON') && (
            <div className="mt-1 pt-2 border-t border-slate-700 flex flex-col gap-1.5">
              {data.pompa === 'ON' && (
                <div className="flex justify-between items-center gap-6">
                  <span className="text-blue-400">Status Pompa :</span>
                  <span className="font-bold text-blue-400">MENYALA</span>
                </div>
              )}
              {data.lampu === 'ON' && (
                <div className="flex justify-between items-center gap-6">
                  <span className="text-yellow-400">Status Lampu :</span>
                  <span className="font-bold text-yellow-400">MENYALA</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export function SensorChart({ data }: { data: any[] }) {
  // Extracting active time ranges based on status keys
  const pumpRanges = useMemo(() => getActiveRanges(data, 'pompa'), [data]);
  const lampRanges = useMemo(() => getActiveRanges(data, 'lampu'), [data]);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="createdAt" 
            tick={{fontSize: 10}} 
            opacity={0.5} 
            tickFormatter={(value) => {
              if (!value) return "";
              return new Date(value).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' });
            }}
          />
          <YAxis yAxisId="left" tick={{fontSize: 10}} opacity={0.5} />
          <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10}} opacity={0.5} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          
          {/* Shaded Areas for Active Status */}
          {pumpRanges.map((range, index) => (
            <ReferenceArea key={`pump-${index}`} x1={range.start} x2={range.end} yAxisId="left" fill="#3b82f6" fillOpacity={0.15} strokeOpacity={0} />
          ))}
          {lampRanges.map((range, index) => (
            <ReferenceArea key={`lamp-${index}`} x1={range.start} x2={range.end} yAxisId="left" fill="#fef08a" fillOpacity={0.15} strokeOpacity={0} />
          ))}

          <Line yAxisId="left" type="monotone" dataKey="tanah" name="Kelembapan Tanah" stroke="#10b981" strokeWidth={2} dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="suhu" name="Suhu (°C)" stroke="#f59e0b" strokeWidth={2} dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="humidity" name="Kelembapan Udara (%)" stroke="#3b82f6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ActionChart({ data }: { data: any[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="time" tick={{fontSize: 10}} opacity={0.5} />
          <YAxis tick={{fontSize: 10}} opacity={0.5} />
          <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px', backgroundColor: '#1e293b', color: '#fff', border: 'none' }} cursor={{fill: '#334155', opacity: 0.4}} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="durasiPompaMs" name="Durasi Pompa (ms)" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
