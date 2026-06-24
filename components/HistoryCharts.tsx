"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export function SensorChart({ data }: { data: any[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="time" tick={{fontSize: 10}} opacity={0.5} />
          <YAxis yAxisId="left" tick={{fontSize: 10}} opacity={0.5} />
          <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10}} opacity={0.5} />
          <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px', backgroundColor: '#1e293b', color: '#fff', border: 'none' }} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
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
