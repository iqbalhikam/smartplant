import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { SmartPlantData, MQTTConfig } from "../types";

const MQTT_BROKER_URL = process.env.NEXT_PUBLIC_MQTT_BROKER_URL || "";
const MQTT_USERNAME = process.env.NEXT_PUBLIC_MQTT_USERNAME || "";
const MQTT_PASSWORD = process.env.NEXT_PUBLIC_MQTT_PASSWORD || "";

export const DEFAULT_TELEMETRY: SmartPlantData = {
  tanah: 1600,
  cahaya: 0,
  pompa: 0,
  lampu: 0,
  mode: "AUTO",
  batasKering: 1725,
  batasBasah: 1200,
};

export function useMQTT() {
  const [config, setConfig] = useState<MQTTConfig>({
    brokerUrl: MQTT_BROKER_URL,
    deviceId: "",
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD
  });

  const [deviceIdInput, setDeviceIdInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [loadingStorage, setLoadingStorage] = useState(true);
  const [telemetry, setTelemetry] = useState<SmartPlantData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected" | "error">("disconnected");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [mqttError, setMqttError] = useState<string | null>(null);
  const [otaLogs, setOtaLogs] = useState<string[]>([]);

  const clientRef = useRef<any>(null);

  // Load config from localStorage on mount
  useEffect(() => {
    const savedDeviceId = localStorage.getItem("smartplant_device_id");
    if (savedDeviceId) {
      const activeConfig = {
        brokerUrl: MQTT_BROKER_URL,
        deviceId: savedDeviceId,
        username: MQTT_USERNAME,
        password: MQTT_PASSWORD,
      };
      setConfig(activeConfig);
      setIsConnected(true);
      setIsDemoMode(false);
      connectMQTT(activeConfig);
    }
    setLoadingStorage(false);
  }, []);

  // Save device ID to localStorage when successfully connected
  useEffect(() => {
    if (connectionStatus === "connected" && config.deviceId) {
      localStorage.setItem("smartplant_device_id", config.deviceId);
      setIsConnected(true);
    }
  }, [connectionStatus, config.deviceId]);

  // Connect helper from onboarding
  const handleConnect = (explicitId?: string) => {
    const targetId = explicitId || deviceIdInput;
    if (!targetId.trim()) return;
    const activeConfig = {
      brokerUrl: MQTT_BROKER_URL,
      deviceId: targetId.trim(),
      username: MQTT_USERNAME,
      password: MQTT_PASSWORD,
    };
    setConfig(activeConfig);
    connectMQTT(activeConfig);
  };

  // Demo mode launcher
  const handleEnterDemo = () => {
    setIsDemoMode(true);
    setIsConnected(true);
    setTelemetry(DEFAULT_TELEMETRY);
  };

  // Disconnect handler
  const handleDisconnect = () => {
    disconnectMQTT();
    localStorage.removeItem("smartplant_device_id");
    setIsConnected(false);
    setDeviceIdInput("");
    setIsDemoMode(false);
  };

  // Connect to MQTT Broker
  const connectMQTT = async (targetConfig: MQTTConfig) => {
    setIsDemoMode(false);
    setConnectionStatus("connecting");
    setMqttError(null);

    let formattedUrl = targetConfig.brokerUrl.trim();
    if (!formattedUrl) {
      setConnectionStatus("error");
      setMqttError("Broker URL cannot be empty.");
      return;
    }

    if (!formattedUrl.startsWith("ws://") && !formattedUrl.startsWith("wss://")) {
      formattedUrl = `wss://${formattedUrl}`;
    }

    const updatedConfig = { ...targetConfig, brokerUrl: formattedUrl };
    setConfig(updatedConfig);

    if (clientRef.current) {
      try {
        clientRef.current.end();
      } catch (e) {
        console.error("Error closing previous client:", e);
      }
    }

    try {
      const mqttModule = await import("mqtt");
      const mqtt = mqttModule.default || mqttModule;

      if (!mqtt || typeof mqtt.connect !== "function") {
        throw new Error("MQTT library does not export connect method.");
      }

      let hostname = "";
      let port = 8884;
      let path = "/mqtt";
      let isSecure = formattedUrl.startsWith("wss://");

      try {
        const urlObj = new URL(formattedUrl);
        hostname = urlObj.hostname;
        port = urlObj.port ? parseInt(urlObj.port) : (isSecure ? 8884 : 8083);
        path = urlObj.pathname || "/mqtt";
      } catch (e) {
        const cleanUrl = formattedUrl.replace(/^wss?:\/\//, "");
        const parts = cleanUrl.split(":");
        hostname = parts[0].split("/")[0];
        if (parts[1]) {
          port = parseInt(parts[1].split("/")[0]) || (isSecure ? 8884 : 8083);
          const slashIdx = parts[1].indexOf("/");
          if (slashIdx !== -1) {
            path = parts[1].substring(slashIdx);
          }
        }
      }

      const options = {
        host: hostname,
        port: port,
        path: path,
        protocol: (isSecure ? "wss" : "ws") as any,
        clientId: `${targetConfig.deviceId}_web_${Math.random().toString(16).substring(2, 8)}`,
        username: targetConfig.username || undefined,
        password: targetConfig.password || undefined,
        clean: true,
        connectTimeout: 15000,
        reconnectPeriod: 5000,
        keepalive: 60,
      };

      console.log("Connecting to MQTT broker with options:", options);
      const client = mqtt.connect(options);
      clientRef.current = client;

      client.on("connect", () => {
        setConnectionStatus("connected");
        console.log("MQTT Client Connected!");
        toast.success("Koneksi Berhasil", {
          description: `Terhubung ke Device ID: ${targetConfig.deviceId}`,
        });

        // Subscribe to telemetry topic
        const subTopic = `${targetConfig.deviceId}/telemetry`;
        client.subscribe(subTopic, { qos: 0 }, (err) => {
          if (err) {
            console.error("Subscription error:", err);
            toast.error("Gagal berlangganan topik telemetri");
          } else {
            console.log(`Subscribed to topic: ${subTopic}`);
          }
        });

        // Subscribe to OTA log topic
        const otaTopic = `${targetConfig.deviceId}/ota`;
        client.subscribe(otaTopic, { qos: 0 }, (err) => {
          if (err) {
            console.error("OTA topic subscription error:", err);
          } else {
            console.log(`Subscribed to OTA log topic: ${otaTopic}`);
          }
        });
      });

      client.on("message", (topic, message) => {
        const payload = message.toString();

        if (topic === `${targetConfig.deviceId}/telemetry`) {
          try {
            const data = JSON.parse(payload) as SmartPlantData;
            console.log("MQTT Telemetry Received (cahaya):", data.cahaya, "Full Data:", data);
            setTelemetry(data);
          } catch (err) {
            console.error("Failed to parse telemetry payload:", err);
          }
        }

        if (topic === `${targetConfig.deviceId}/ota`) {
          const timestamp = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
          const logEntry = `[${timestamp}] ${payload}`;
          console.log("OTA Log:", logEntry);
          setOtaLogs(prev => [...prev, logEntry]);
        }
      });

      client.on("error", (err) => {
        console.error("MQTT Connection Error:", err);
        setConnectionStatus("error");
        const errMsg = err.message || "Failed to connect to broker.";
        setMqttError(errMsg);
        toast.error("Koneksi MQTT Terputus", {
          description: errMsg,
        });

        if (err.message && (
          err.message.includes("connack") ||
          err.message.includes("Not authorized") ||
          err.message.includes("timeout") ||
          err.message.includes("Connection refused")
        )) {
          console.warn("Terminating client connection loop.");
          try {
            client.end();
          } catch (e) {
            console.error("Error closing client:", e);
          }
        }
      });

      client.on("close", () => {
        console.log("MQTT Connection Closed");
        setConnectionStatus("disconnected");
      });

    } catch (err: any) {
      console.error("MQTT Init Error:", err);
      setConnectionStatus("error");
      setMqttError("MQTT Library failed to load.");
      toast.error("Pustaka MQTT gagal dimuat");
    }
  };

  const disconnectMQTT = () => {
    if (clientRef.current) {
      clientRef.current.end();
      clientRef.current = null;
    }
    setConnectionStatus("disconnected");
    setTelemetry(null);
    toast.info("Koneksi MQTT terputus");
  };

  const publishCommand = (command: string) => {
    if (isDemoMode) {
      setTelemetry(prev => {
        if (!prev) return null;
        const updated = { ...prev };
        if (command.startsWith("MODE:")) {
          updated.mode = command.split(":")[1] as "AUTO" | "MANUAL";
        }
        if (updated.mode === "MANUAL") {
          if (command.startsWith("PUMP:")) {
            updated.pompa = command.split(":")[1] === "ON" ? 1 : 0;
          }
          if (command.startsWith("LAMP:")) {
            updated.lampu = command.split(":")[1] === "ON" ? 1 : 0;
          }
        }
        return updated;
      });
      toast.success(`Simulator: Perintah "${command}" disimulasikan`);
      return;
    }

    if (clientRef.current && connectionStatus === "connected") {
      const topic = `${config.deviceId}/cmd`;
      clientRef.current.publish(topic, command, { qos: 1 }, (err: any) => {
        if (err) {
          console.error("Failed to publish command:", err);
          toast.error(`Gagal mengirim perintah: "${command}"`);
        } else {
          toast.success(`Berhasil mengirim perintah: "${command}"`, {
            description: `Topik: ${topic}`,
          });
        }
      });
    }
  };

  // Demo simulator cycle
  useEffect(() => {
    if (!isDemoMode) return;
    setTelemetry(prev => prev || { ...DEFAULT_TELEMETRY });

    const interval = setInterval(() => {
      setTelemetry(prev => {
        if (!prev) return { ...DEFAULT_TELEMETRY };

        let nextTanah = prev.tanah;
        let nextPompa = prev.pompa;

        if (prev.pompa === 1) {
          nextTanah = Math.max(900, prev.tanah - 120);
        } else {
          nextTanah = Math.min(3000, prev.tanah + 35);
        }

        if (prev.mode === "AUTO") {
          if (nextTanah >= prev.batasKering) {
            nextPompa = 1;
          } else if (nextTanah <= prev.batasBasah) {
            nextPompa = 0;
          }
        }

        return {
          ...prev,
          tanah: nextTanah,
          pompa: nextPompa,
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isDemoMode]);

  // Clean up client on unmount
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.end();
      }
    };
  }, []);

  const clearOtaLogs = () => setOtaLogs([]);

  return {
    config,
    deviceIdInput,
    setDeviceIdInput,
    isConnected,
    setIsConnected,
    loadingStorage,
    telemetry,
    setTelemetry,
    connectionStatus,
    setConnectionStatus,
    isDemoMode,
    setIsDemoMode,
    mqttError,
    setMqttError,
    otaLogs,
    clearOtaLogs,
    handleConnect,
    handleEnterDemo,
    handleDisconnect,
    publishCommand
  };
}
