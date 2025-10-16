const colors = {
  background: "#021015",
  substrate: "rgba(14, 52, 66, 0.72)",
  tapeHighlight: "rgba(255, 170, 0, 0.8)",
  tapeBase: "rgba(12, 92, 108, 0.65)",
  tapeShadow: "rgba(3, 20, 28, 0.9)",
  anomaly: "rgba(220, 220, 220, 0.8)",
  textPrimary: "#97d5d8",
  textSecondary: "rgba(140, 220, 210, 0.8)",
  scanline: "rgba(255, 255, 255, 0.05)",
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
  drawTimeTapes(ctx, width, height, timeNow, scanParams, techParams, systemData);
  drawScrubber(ctx, width, height, timeNow, scanParams);
  drawTelemetry(ctx, width, height, timeNow, scanParams, techParams, systemData);
  drawScanlines(ctx, width, height, timeNow);
}

function drawBackground(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#01090d");
  gradient.addColorStop(1, colors.background);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawTimeTapes(ctx, width, height, time, scanParams, techParams, systemData) {
  const tapeCount = 9;
  const tapeHeight = height / (tapeCount + 2);
  const jitter = Math.sin(time / 240) * 2 * (techParams.energyLevel / 12 + 0.4);
  const scanPulse = scanParams.scanProgress * 0.3 + 0.05;
  const anomalies = systemData?.anomalies ?? [];

  for (let i = 0; i < tapeCount; i++) {
    const y = (i + 1) * tapeHeight;
    ctx.save();
    ctx.translate(0, y + jitter * Math.sin(i + time / 300));

    const tapeGradient = ctx.createLinearGradient(0, -tapeHeight * 0.45, 0, tapeHeight * 0.45);
    tapeGradient.addColorStop(0, colors.tapeHighlight);
    tapeGradient.addColorStop(0.4, colors.tapeBase);
    tapeGradient.addColorStop(1, colors.tapeShadow);

    ctx.fillStyle = tapeGradient;
    ctx.fillRect(width * 0.08, -tapeHeight * 0.45, width * 0.84, tapeHeight * 0.9);

    const segments = 18;
    const segmentWidth = (width * 0.84) / segments;
    const progressOffset = (time / 280 + i * 0.2) % 1;

    for (let s = 0; s < segments; s++) {
      const localTime = (s / segments + progressOffset) % 1;
      const glow = Math.pow(Math.sin(localTime * Math.PI), 2);
      ctx.fillStyle = `rgba(255, 190, 90, ${0.05 + glow * 0.35})`;
      ctx.fillRect(width * 0.08 + s * segmentWidth, -tapeHeight * 0.45, segmentWidth - 2, tapeHeight * 0.9);
    }

    ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(width * 0.08, -tapeHeight * 0.45, width * 0.84, tapeHeight * 0.9);

    ctx.strokeStyle = `rgba(151, 213, 216, ${0.2 + scanPulse})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width * 0.08, 0);
    ctx.lineTo(width * 0.92, 0);
    ctx.stroke();

    anomalies
      .filter((anomaly) => anomaly.tape === i)
      .forEach((anomaly) => {
        const pos = width * 0.08 + anomaly.position * width * 0.84;
        const pulse = Math.sin(time / 160 + anomaly.position * 10) * 0.3 + 0.7;
        ctx.fillStyle = colors.anomaly;
        ctx.globalAlpha = 0.4 + pulse * 0.5;
        ctx.fillRect(pos - 4, -tapeHeight * 0.5, 8, tapeHeight);
        ctx.globalAlpha = 1;
      });

    ctx.restore();
  }
}

function drawScrubber(ctx, width, height, time, scanParams) {
  const scrubY = height * 0.5 + Math.sin(time / 900) * height * 0.12;
  const progress = scanParams.scanProgress;
  const scrubX = width * (0.1 + progress * 0.8);

  ctx.save();
  ctx.strokeStyle = "rgba(255, 210, 120, 0.6)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(scrubX, height * 0.12);
  ctx.lineTo(scrubX, height * 0.88);
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 210, 120, 0.3)";
  ctx.beginPath();
  ctx.arc(scrubX, scrubY, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 210, 120, 0.7)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(scrubX, scrubY, 22 + Math.sin(time / 140) * 2, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawTelemetry(ctx, width, height, time, scanParams, techParams, systemData) {
  const padding = 30;
  ctx.save();
  ctx.textAlign = "left";
  ctx.fillStyle = colors.textPrimary;
  ctx.font = `20px ${fonts.display}`;
  ctx.fillText("CHRONO ARCHIVE TIME TABLE", padding, padding + 6);

  ctx.font = `13px ${fonts.mono}`;
  ctx.fillStyle = colors.textSecondary;
  ctx.fillText(
    `SCAN POSITION: ${(scanParams.scanProgress * 100).toFixed(1)}%`,
    padding,
    padding + 30
  );
  ctx.fillText(
    `ENERGY MODULATION: ${(techParams.energyLevel ?? 0).toFixed(2)}`,
    padding,
    padding + 48
  );

  const anomalyCount = systemData?.anomalies?.length ?? 0;
  ctx.fillText(`ANOMALIES TRACKED: ${anomalyCount}`, padding, padding + 66);

  ctx.textAlign = "right";
  ctx.fillText(
    `TAPE DRIFT: ${((systemData?.tapeJitter ?? 0) * 100).toFixed(2)}%`,
    width - padding,
    padding + 30
  );
  ctx.fillText(
    `ARCHIVE AGE: ${(systemData?.archiveAge ?? 1200).toLocaleString()} cycles`,
    width - padding,
    padding + 48
  );

  ctx.globalAlpha = 0.75;
  ctx.strokeStyle = "rgba(120, 200, 210, 0.35)";
  ctx.strokeRect(padding, height - 90, width - padding * 2, 52);
  ctx.globalAlpha = 1;

  const bars = 26;
  const startX = padding + 10;
  const baseY = height - 44;
  const barWidth = (width - padding * 2 - 20) / bars;
  for (let i = 0; i < bars; i++) {
    const modulation = Math.sin(time / 220 + i * 0.3) * 0.5 + 0.5;
    const barHeight = 20 + modulation * 26 * (scanParams.scanProgress + 0.3);
    ctx.fillStyle = `rgba(180, 220, 210, ${0.2 + 0.6 * (i / bars)})`;
    ctx.fillRect(startX + i * barWidth, baseY - barHeight, barWidth * 0.7, barHeight);
  }

  ctx.restore();
}

function drawScanlines(ctx, width, height, time) {
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = colors.scanline;
  const offset = (time / 28) % 4;
  for (let y = 0; y < height; y += 4) {
    ctx.fillRect(0, y + offset, width, 2);
  }
  ctx.restore();
}
