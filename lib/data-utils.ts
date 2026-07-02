export function mergeChartData(sensorLogs: any[], actionLogs: any[]) {
  if (!sensorLogs || sensorLogs.length === 0) return [];
  if (!actionLogs) actionLogs = [];

  const sortedSensors = [...sensorLogs].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const sortedActions = [...actionLogs].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Assume sensor interval is around 5 minutes or less
  const INTERVAL = 5 * 60 * 1000;

  return sortedSensors.map(log => {
    const logTime = new Date(log.createdAt).getTime();
    
    // Pump is considered ON for this sensor reading if an action triggered the pump
    // within the interval before this reading, or if its duration overlaps.
    const isPumpActive = sortedActions.some(action => {
      if (!action.durasiPompaMs) return false;
      const actionTime = new Date(action.createdAt).getTime();
      // Allow the action to be associated with this sensor log if it happened 
      // around the same time (before or after, since action logs often occur 
      // milliseconds after the sensor log that triggered them)
      return Math.abs(logTime - actionTime) <= Math.max(INTERVAL, action.durasiPompaMs);
    });

    let isLampActive = false;
    for (let i = sortedActions.length - 1; i >= 0; i--) {
      const actionTime = new Date(sortedActions[i].createdAt).getTime();
      // Allow 1 minute leeway in case the action was triggered by this log
      if (actionTime <= logTime + 60000) {
        if (sortedActions[i].lampuNyala) {
          isLampActive = true;
        }
        break;
      }
    }

    return {
      ...log,
      pompa: isPumpActive ? "ON" : "OFF",
      lampu: isLampActive ? "ON" : "OFF",
      time: new Date(log.createdAt).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })
    };
  });
}
