const colors = {
  backgroundTop: "#040311",
  backgroundBottom: "#090021",
  vaultGlow: "rgba(0, 255, 255, 0.12)",
  pillarIdle: "rgba(0, 220, 255, 0.4)",
  pillarActive: "rgba(255, 255, 255, 0.65)",
  beamAccent: "#c77dff",
  crossbeamWarning: "#ff3f6a",
  telemetry: "#8dffef",
  text: "#e8f7ff",
  scanline: "rgba(255, 255, 255, 0.06)",
};

const fonts = {
  display: "'Courier New', 'Courier', monospace",
  mono: "'Courier New', 'Courier', monospace",
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

  ctx.clearRect(0, 0, width, height);
  drawBackground(ctx, width, height);
  drawVaultedFrame(ctx, width, height, timeNow);
  drawDataPillars(ctx, width, height, timeNow, scanParams, systemData);
  drawCrossbeams(ctx, width, height, timeNow, systemData);
  drawTelemetry(ctx, width, height, timeNow, scanParams, techParams, systemData);
  drawScanlines(ctx, width, height, timeNow);
}

function drawBackground(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, colors.backgroundTop);
  gradient.addColorStop(1, colors.backgroundBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawVaultedFrame(ctx, width, height, time) {
  ctx.save();
  ctx.strokeStyle = colors.vaultGlow;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.8;

  const columnCount = 5;
  const spacing = width / (columnCount + 1);
  const baseY = height * 0.8;
  const apexY = height * 0.12;

  for (let i = 1; i <= columnCount; i++) {
    const x = spacing * i;
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.quadraticCurveTo(width / 2, apexY, width - x, baseY);
    ctx.stroke();
  }

  ctx.globalAlpha = 0.35;
  ctx.fillStyle = colors.vaultGlow;
  ctx.beginPath();
  ctx.moveTo(width * 0.18, baseY);
  ctx.quadraticCurveTo(width / 2, apexY * (1 + Math.sin(time / 2600) * 0.08), width * 0.82, baseY);
  ctx.lineTo(width * 0.18, baseY);
  ctx.fill();
  ctx.restore();
}

function drawDataPillars(ctx, width, height, time, scanParams, systemData) {
  ctx.save();
  const pillars = 8;
  const spacing = width / (pillars + 1);
  const baseY = height * 0.85;
  const topY = height * 0.25;
  const throughput = (systemData?.throughput ?? 0.4) + 0.2;

  for (let i = 0; i < pillars; i++) {
    const x = spacing * (i + 1);
    const modulation = Math.sin(time / 400 + i * 0.6) * 0.35 + 0.65;
    const activity = scanParams.scanProgress * 0.5 + throughput * 0.5;
    const heightFactor = Math.max(0.2, activity * modulation);

    const pillarHeight = (baseY - topY) * heightFactor;
    const y = baseY - pillarHeight;
    const gradient = ctx.createLinearGradient(x, y, x, baseY);
    gradient.addColorStop(0, colors.pillarActive);
    gradient.addColorStop(1, colors.pillarIdle);

    ctx.fillStyle = gradient;
    ctx.fillRect(x - 8, y, 16, pillarHeight);

    ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 + heightFactor * 0.5})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 12);
    ctx.lineTo(x - 10, baseY + 18);
    ctx.moveTo(x + 10, y - 12);
    ctx.lineTo(x + 10, baseY + 18);
    ctx.stroke();

    ctx.globalAlpha = 0.8;
    ctx.fillStyle = colors.beamAccent;
    const pulse = Math.sin(time / 300 + i) * 6;
    ctx.fillRect(x - 18, y - 20 + pulse, 36, 2);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function drawCrossbeams(ctx, width, height, time, systemData) {
  ctx.save();
  const baseY = height * 0.3;
  const beamCount = 4;
  const warningLevel = Math.max(0, Math.min(1, systemData?.latency ?? 0));

  for (let i = 0; i < beamCount; i++) {
    const y = baseY + i * height * 0.1;
    const flicker = (Math.sin(time / 200 + i) + 1) * 0.5;
    const warningPulse = warningLevel > 0.4 ? Math.sin(time / 120 + i) * warningLevel : 0;

    ctx.globalAlpha = 0.5 + flicker * 0.3;
    ctx.strokeStyle = colors.beamAccent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width * 0.2, y);
    ctx.lineTo(width * 0.8, y);
    ctx.stroke();

    if (warningLevel > 0.1) {
      ctx.strokeStyle = colors.crossbeamWarning;
      ctx.globalAlpha = 0.35 + warningPulse * 0.5;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(width * 0.2, y - 6);
      ctx.lineTo(width * 0.8, y - 6);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function drawTelemetry(ctx, width, height, time, scanParams, techParams, systemData) {
  ctx.save();
  const padding = 32;
  ctx.textAlign = "left";

  ctx.fillStyle = colors.text;
  ctx.font = `20px ${fonts.display}`;
  ctx.fillText("NEON CATHEDRAL COMMAND DECK", padding, padding + 6);

  ctx.font = `13px ${fonts.mono}`;
  ctx.fillStyle = colors.telemetry;
  const heartbeat = (systemData?.heartbeat ?? 0.5) * 100;
  ctx.fillText(`HEARTBEAT: ${heartbeat.toFixed(1)} bpm`, padding, padding + 30);
  ctx.fillText(
    `SCAN SYNC: ${(scanParams.scanProgress * 100).toFixed(0)}%`,
    padding,
    padding + 48
  );
  ctx.fillText(
    `ENERGY LEVEL: ${(techParams.energyLevel ?? 0).toFixed(1)}`,
    padding,
    padding + 66
  );

  ctx.textAlign = "right";
  ctx.fillText(
    `LATENCY: ${(systemData?.latency ?? 0).toFixed(2)} ms`,
    width - padding,
    padding + 30
  );
  ctx.fillText(
    `THROUGHPUT: ${((systemData?.throughput ?? 0) * 100).toFixed(1)}%`,
    width - padding,
    padding + 48
  );

  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = "rgba(140, 255, 255, 0.35)";
  ctx.strokeRect(padding, height - 100, width - padding * 2, 56);

  const beams = 24;
  const startX = padding + 10;
  const baseY = height - 48;
  const beamWidth = (width - padding * 2 - 20) / beams;
  const heartbeatPulse = Math.sin(time / 120) * 0.3 + 0.7;

  for (let i = 0; i < beams; i++) {
    const modulation = Math.sin(time / 180 + i * 0.4) * 0.4 + 0.6;
    const heightMod = modulation * (0.4 + (systemData?.throughput ?? 0.3));
    const pillar = heartbeatPulse * heightMod * 32;
    ctx.fillStyle = `rgba(141, 255, 239, ${0.25 + 0.5 * (i / beams)})`;
    ctx.fillRect(startX + i * beamWidth, baseY - pillar, beamWidth * 0.6, pillar);
  }

  ctx.restore();
}

function drawScanlines(ctx, width, height, time) {
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = colors.scanline;
  const offset = (time / 24) % 4;
  for (let y = 0; y < height; y += 4) {
    ctx.fillRect(0, y + offset, width, 2);
  }
  ctx.restore();
}
