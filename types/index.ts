export interface SmartPlantData {
  tanah: number;          // 0 (Sangat Basah) - 4095 (Sangat Kering)
  cahaya: number;         // 0: Terang, 1: Gelap
  pompa: number;          // 0: OFF, 1: ON
  lampu: number;          // 0: OFF, 1: ON
  mode: "AUTO" | "MANUAL";
  batasKering: number;
  batasBasah: number;
  calKering: number;      // Nilai kalibrasi batas kering dari ESP32
  calBasah: number;       // Nilai kalibrasi batas basah dari ESP32
  air?: number;           // Level air. Jika -1, berarti sensor fisik tidak dipasang/dinonaktifkan.
  suhu?: number;          // Suhu Celcius. Jika -1, berarti sensor fisik dinonaktifkan.
  version?: string;
  rule?: string;          // Kode Fuzzy Logic yang memicu tindakan
}

export interface MQTTConfig {
  brokerUrl: string;
  deviceId: string;
  username: string;
  password?: string;
}
