"use client";

import React, { createContext, useContext } from "react";
import { useMQTT } from "../hooks/useMQTT";

type MQTTContextType = ReturnType<typeof useMQTT>;

const MQTTContext = createContext<MQTTContextType | null>(null);

export function MQTTProvider({ children }: { children: React.ReactNode }) {
  const mqttState = useMQTT();

  return (
    <MQTTContext.Provider value={mqttState}>
      {children}
    </MQTTContext.Provider>
  );
}

export function useMQTTContext() {
  const context = useContext(MQTTContext);
  if (!context) {
    throw new Error("useMQTTContext must be used within an MQTTProvider");
  }
  return context;
}
