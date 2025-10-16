const colors = {
  background: "#010b10",
  sonarGlow: "rgba(0, 255, 255, 0.4)",
  sonarCore: "#00ffaa",
  ping: "rgba(255, 0, 255, 0.5)",
  text: "#00ffaa",
  accent: "#ff00ff",
  grid: "rgba(0, 255, 255, 0.2)",
  scanline: "rgba(255, 255, 255, 0.04)",
};

const fonts = {
  hud: "12px 'Courier New', monospace",
  readout: "14px 'Courier New', monospace",
};

export { colors, fonts };

export function drawInterface(
  canvas,
  ctx,
  scanParams,
  techParams,
  chromaticParams,
  systemData
) {
  void chromaticParams;
  const width = canvas.width;
  const height = canvas.height;
  const timeNow = Date.now();
  const sweepSpeed = (techParams?.energyLevel ?? 5) * 0.3;

  ctx.clearRect(0, 0, width, height);
  drawBackground(ctx, width, height);
  drawSonarGrid(ctx, width, height);
  drawSweep(ctx, width, height, timeNow, sweepSpeed, systemData);
  drawReadouts(ctx, width, height, timeNow, scanParams, systemData);
  drawScanlines(ctx, width, height, timeNow);
}

function drawBackground(ctx, width, height) {
  const gradient = ctx.createRadialGradient(width / 2, height / 2, width * 0.1, width / 2, height / 2, width * 0.7);
  gradient.addColorStop(0, "#001015");
  gradient.addColorStop(1, "#00050a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawSonarGrid(ctx, width, height) {
  const centerX = width / 2;
  const centerY = height * 0.55;
  const radius = Math.min(width, height) * 0.35;

  ctx.save();
  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1;

  for (let r = radius; r > 0; r -= radius / 6) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
    ctx.stroke();
  }

  ctx.restore();
}

function drawSweep(ctx, width, height, timeNow, sweepSpeed, systemData) {
  const centerX = width / 2;
  const centerY = height * 0.55;
  const radius = Math.min(width, height) * 0.35;
  const angle = ((timeNow / 1000) * sweepSpeed) % (Math.PI * 2);

  ctx.save();
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
  gradient.addColorStop(0, "rgba(0, 255, 255, 0.3)");
  gradient.addColorStop(1, "rgba(0, 255, 255, 0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, angle - 0.2, angle + 0.2);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = colors.sonarCore;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
  ctx.stroke();

  const pings = systemData?.pings ?? [
    { distance: 0.5, intensity: 0.7, label: "RIDGE" },
    { distance: 0.8, intensity: 0.6, label: "CONTACT" },
  ];

  pings.forEach((ping, index) => {
    const pingAngle = angle - 0.4 + index * 0.35;
    const pingRadius = radius * ping.distance;
    ctx.strokeStyle = `rgba(255, 0, 255, ${0.6 * ping.intensity})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, pingRadius, pingAngle - 0.1, pingAngle + 0.1);
    ctx.stroke();

    const markerX = centerX + Math.cos(pingAngle) * pingRadius;
    const markerY = centerY + Math.sin(pingAngle) * pingRadius;
    ctx.fillStyle = colors.sonarCore;
    ctx.beginPath();
    ctx.arc(markerX, markerY, 4 + ping.intensity * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.ping;
    ctx.stroke();

    ctx.fillStyle = colors.text;
    ctx.font = fonts.hud;
    ctx.textAlign = "center";
    ctx.fillText(ping.label, markerX, markerY - 12);
  });

  ctx.restore();
}

function drawReadouts(ctx, width, height, timeNow, scanParams, systemData) {
  ctx.save();
  ctx.fillStyle = colors.accent;
  ctx.font = fonts.readout;
  ctx.textAlign = "left";
  ctx.fillText("ABYSSAL SONAR ARRAY", width * 0.08, height * 0.1 - 12);
  ctx.font = fonts.hud;
  ctx.fillText(`SCAN ${(scanParams?.scanProgress ?? 0).toFixed(2)}`, width * 0.08, height * 0.1 - 26);

  const telemetryY = height * 0.12;
  const telemetrySpacing = 18;
  const telemetry = systemData?.telemetry ?? [
    ["DEPTH", `${(systemData?.depth ?? 3200).toFixed(0)}m`],
    ["TEMP", `${(systemData?.temperature ?? 4.2).toFixed(1)}°C`],
    ["PRESS", `${(systemData?.pressure ?? 32.4).toFixed(1)}MPa`],
  ];

  telemetry.forEach((row, index) => {
    ctx.fillText(`${row[0]} ${row[1]}`, width * 0.08, telemetryY + index * telemetrySpacing);
  });

  ctx.textAlign = "right";
  ctx.fillText(`ENERGY ${(systemData?.power ?? 78).toFixed(1)}%`, width * 0.92, telemetryY);
  ctx.fillText(`NOISE ${(Math.abs(Math.sin(timeNow / 500)) * 14).toFixed(1)}dB`, width * 0.92, telemetryY + telemetrySpacing);
  ctx.restore();
}

function drawScanlines(ctx, width, height, timeNow) {
  ctx.save();
  ctx.fillStyle = colors.scanline;
  const offset = (timeNow / 24) % 4;
  for (let y = -offset; y < height; y += 4) {
    ctx.fillRect(0, y, width, 2);
  }
  ctx.restore();
}
