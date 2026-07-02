import { mergeChartData } from './lib/data-utils.js';

async function run() {
  const deviceId = '1'; // Assuming deviceId '1', but let's fetch any available device logs if we can't find '1'.
  
  // We don't know the exact device ID, let's just fetch all and find the first action log.
  // Actually, /api/logs/sensor and /api/logs/action accept optional deviceId in the backend GET.
  // Wait, in `route.ts`, if deviceId is not provided, it fetches all logs.
  
  const sensorRes = await fetch(`http://localhost:3000/api/logs/sensor`);
  const sensorData = await sensorRes.json();
  
  const actionRes = await fetch(`http://localhost:3000/api/logs/action`);
  const actionData = await actionRes.json();
  
  const sensorLogs = sensorData.data || [];
  const actionLogs = actionData.data || [];
  
  console.log("Sensor Logs count:", sensorLogs.length);
  console.log("Action Logs count:", actionLogs.length);
  
  if (actionLogs.length > 0) {
    console.log("Latest Action Log:", actionLogs[0]);
  }
  
  const merged = mergeChartData(sensorLogs, actionLogs);
  const activePoints = merged.filter((m: any) => m.pompa === 'ON' || m.lampu === 'ON');
  console.log(`Active Pumps points: ${merged.filter((m: any) => m.pompa === 'ON').length}`);
  console.log(`Active Lamps points: ${merged.filter((m: any) => m.lampu === 'ON').length}`);
  
  console.log("Merged active points:", activePoints.map((p: any) => ({ time: p.time, pompa: p.pompa, lampu: p.lampu, createdAt: p.createdAt })));

  console.log("\nRanges output:");
  function getActiveRanges(data: any[], key: string) {
    const ranges: { start: string; end: string }[] = [];
    let start: string | null = null;
    
    for (let i = 0; i < data.length; i++) {
      const val = data[i][key];
      const isActive = val === 1 || val === "1" || val === true || val === "ON" || val === "true";
      
      if (isActive && start === null) {
        start = data[i].time;
      } else if (!isActive && start !== null) {
        ranges.push({ start, end: data[i].time });
        start = null;
      }
    }
    if (start !== null && data.length > 0) {
      ranges.push({ start, end: data[data.length - 1].time });
    }
    return ranges;
  }
  
  console.log("Pump Ranges:", getActiveRanges(merged, 'pompa'));
  console.log("Lamp Ranges:", getActiveRanges(merged, 'lampu'));
}
run();
