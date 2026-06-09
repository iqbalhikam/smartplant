export interface SmartPlantData {
  tanah: number;          // 0 (Sangat Basah) - 4095 (Sangat Kering)
  cahaya: number;         // 0: Terang, 1: Gelap
  pompa: number;          // 0: OFF, 1: ON
  lampu: number;          // 0: OFF, 1: ON
  mode: "AUTO" | "MANUAL";
  batasKering: number;    // Nilai batas tanah butuh disiram
  batasBasah: number;     // Nilai batas tanah sudah cukup air
  version?: string;       // Versi firmware ESP32 (contoh: "v1.0.0")
}

export interface MQTTConfig {
  brokerUrl: string;
  deviceId: string;
  username: string;
  password?: string;
}
