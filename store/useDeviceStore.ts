import { create } from "zustand";

interface DeviceStore {
  activeDeviceId: string | null;
  setActiveDeviceId: (id: string | null) => void;
}

export const useDeviceStore = create<DeviceStore>((set) => ({
  activeDeviceId: null,
  setActiveDeviceId: (id) => {
    if (typeof window !== "undefined") {
      if (id) {
        localStorage.setItem("smartplant_active_device", id);
      } else {
        localStorage.removeItem("smartplant_active_device");
      }
    }
    set({ activeDeviceId: id });
  },
}));
