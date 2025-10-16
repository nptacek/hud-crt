const colors = {
  background: "#040418",
  voidCore: "#050026",
  ringPrimary: "#b100ff",
  ringSecondary: "#ff5fd1",
  telemetry: "#ffd166",
  accent: "#3fffff",
  warning: "#ff3366",
  scanline: "rgba(255, 255, 255, 0.04)",
  distortion: "rgba(25, 10, 80, 0.35)",
};

const fonts = {
  display: "'Courier New', 'Courier', monospace",
  terminal: "'Courier New', 'Courier', monospace",
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
  const { width, height } = canvas;
  const timeNow = Date.now();
  const center = { x: width / 2, y: height * 0.52 };

  ctx.clearRect(0, 0, width, height);
  drawBackground(ctx, width, height);
  drawDistortionWell(ctx, center, width, height, timeNow, techParams);
  drawGravitationalRings(ctx, center, width, height, timeNow, techParams);
  drawTelemetryArcs(ctx, center, width, height, timeNow, scanParams, systemData);
  drawReadouts(ctx, width, height, scanParams, techParams, systemData);
  drawScanlines(ctx, width, height, timeNow);
}

function drawBackground(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#01010a");
  gradient.addColorStop(0.4, colors.background);
  gradient.addColorStop(1, "#000000");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawDistortionWell(ctx, center, width, height, time, techParams) {
  ctx.save();
  ctx.translate(center.x, center.y);
  const maxRadius = Math.min(width, height) * 0.48;
  const ringCount = 6;
  const pulse = 1 + Math.sin(time / 1100) * 0.08 * (techParams.energyLevel / 8 + 1);

  for (let i = ringCount; i >= 0; i--) {
    const t = i / ringCount;
    const radius = maxRadius * t * pulse;
    const opacity = 0.5 * (1 - t) + 0.08;

    ctx.beginPath();
    ctx.fillStyle = `rgba(5, 0, 38, ${opacity})`;
    ctx.ellipse(0, 0, radius * 1.1, radius * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.beginPath();
  ctx.fillStyle = colors.voidCore;
  ctx.ellipse(0, 0, maxRadius * 0.18, maxRadius * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  const shear = Math.sin(time / 900) * 0.18;
  ctx.rotate(shear);
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = colors.distortion;
  for (let i = 0; i < 9; i++) {
    const radius = maxRadius * (0.2 + i * 0.08);
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 1.15, radius * 0.6, shear, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(64, 30, 120, ${0.4 - i * 0.03})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}

function drawGravitationalRings(ctx, center, width, height, time, techParams) {
  ctx.save();
  ctx.translate(center.x, center.y);
  const maxRadius = Math.min(width, height) * 0.45;
  const energy = Math.max(0.4, Math.min(1.6, techParams.energyLevel / 8 + 0.6));
  const ringSpeed = 0.0006 * (techParams.energyLevel + 10);

  for (let i = 0; i < 16; i++) {
    const t = i / 16;
    const radius = maxRadius * (0.25 + t * 0.75);
    const wobble = Math.sin(time * ringSpeed + t * 10) * 8 * energy;
    ctx.strokeStyle = i % 2 === 0 ? colors.ringPrimary : colors.ringSecondary;
    ctx.globalAlpha = 0.3 + 0.4 * (1 - t);
    ctx.lineWidth = 1.2 + (1 - t) * 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius + wobble, radius * 0.58 + wobble * 0.4, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  const pulseScale = 1 + Math.sin(time / 420) * 0.05 * energy;
  ctx.strokeStyle = colors.warning;
  ctx.globalAlpha = 0.32;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(0, 0, maxRadius * 0.52 * pulseScale, maxRadius * 0.28 * pulseScale, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawTelemetryArcs(ctx, center, width, height, time, scanParams, systemData) {
  const { scanProgress = 0 } = scanParams;
  const { gravityWarning = 0, syncVariance = 0 } = systemData || {};
  ctx.save();
  ctx.translate(center.x, center.y);

  const arcRadius = Math.min(width, height) * 0.35;
  ctx.globalAlpha = 0.75;

  const sweep = (Math.PI * 2) * (0.25 + scanProgress * 0.75);
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, arcRadius, -Math.PI / 2, -Math.PI / 2 + sweep, false);
  ctx.stroke();

  ctx.strokeStyle = colors.telemetry;
  ctx.lineWidth = 3;
  const variance = Math.min(1, Math.max(-1, syncVariance));
  const offset = Math.sin(time / 550) * 0.6 + variance * 1.1;
  for (let i = 0; i < 4; i++) {
    const radius = arcRadius * (0.55 + i * 0.08);
    ctx.globalAlpha = 0.45 - i * 0.08;
    ctx.beginPath();
    ctx.arc(0, 0, radius, offset, offset + Math.PI * (0.4 + i * 0.12));
    ctx.stroke();
  }

  const warningLevel = Math.min(1, gravityWarning);
  if (warningLevel > 0.1) {
    const pulse = 0.6 + Math.sin(time / 160) * 0.4 * warningLevel;
    ctx.globalAlpha = 0.3 + warningLevel * 0.6;
    ctx.strokeStyle = colors.warning;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 0, arcRadius * pulse, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawReadouts(ctx, width, height, scanParams, techParams, systemData) {
  const padding = 32;
  ctx.save();
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.font = `14px ${fonts.terminal}`;

  ctx.fillStyle = colors.accent;
  ctx.font = `18px ${fonts.display}`;
  ctx.fillText("EVENT HORIZON SYNCHRONIZER", padding, padding + 6);

  ctx.font = `13px ${fonts.terminal}`;
  ctx.fillStyle = "rgba(163, 214, 255, 0.9)";
  const energy = techParams.energyLevel?.toFixed?.(1) ?? "--";
  ctx.fillText(`ENERGY VECTOR: ${energy}e`, padding, padding + 32);
  ctx.fillText(
    `SCAN COHESION: ${(scanParams.scanProgress * 100).toFixed(0)}%`,
    padding,
    padding + 52
  );

  ctx.textAlign = "right";
  const rightX = width - padding;
  const data = systemData || {};
  ctx.fillStyle = colors.telemetry;
  ctx.fillText(
    `SINGULARITY DRIFT: ${(data.singularityDrift ?? 0).toFixed(3)}μ`,
    rightX,
    padding + 32
  );
  ctx.fillText(
    `SHEAR INDEX: ${(data.shearIndex ?? 0).toFixed(2)}`,
    rightX,
    padding + 52
  );

  ctx.globalAlpha = 0.6;
  ctx.strokeStyle = "rgba(120, 60, 190, 0.4)";
  ctx.strokeRect(padding, height - 96, width - padding * 2, 54);
  ctx.globalAlpha = 1;

  const bars = 20;
  const baseX = padding + 8;
  const baseY = height - 48;
  const barWidth = (width - padding * 2 - 16) / bars;
  const intensity = Math.max(0, techParams.energyLevel || 0) / 12 + 0.4;
  for (let i = 0; i < bars; i++) {
    const modulation = Math.sin(Date.now() / 180 + i * 0.4) * 0.4 + 0.6;
    const barHeight = 24 * modulation * intensity;
    ctx.fillStyle = `rgba(255, 95, 210, ${0.3 + i / bars * 0.6})`;
    ctx.fillRect(baseX + i * barWidth, baseY - barHeight, barWidth * 0.6, barHeight);
  }
  ctx.restore();
}

function drawScanlines(ctx, width, height, time) {
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = colors.scanline;
  const offset = (time / 30) % 4;
  for (let y = 0; y < height; y += 4) {
    ctx.fillRect(0, y + offset, width, 2);
  }
  ctx.restore();
}
