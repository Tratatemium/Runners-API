let serverTimeStart;

const setServerStartTime = () => {
  serverTimeStart = Date.now();
};

const getUptime = () => {
  if (!serverTimeStart) return "00:00:00";
  
  const uptime = Date.now() - serverTimeStart;
  const uptimeSeconds = Math.floor(uptime / 1000);

  const hrs = Math.floor(uptimeSeconds / 3600);
  const mins = Math.floor((uptimeSeconds % 3600) / 60);
  const secs = uptimeSeconds % 60;

  const pad = (n) => n.toString().padStart(2, "0");

  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
};

module.exports = { getUptime, setServerStartTime };
