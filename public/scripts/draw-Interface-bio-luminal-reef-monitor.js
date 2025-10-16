const colors = {
  background: "#00131d",
  viewportEdge: "#0a3245",
  coralGlow: "#ff7f9f",
  aquaPulse: "#33f6ff",
  nutrientCurrent: "#23b9ff",
  organism: "rgba(130, 255, 240, 0.8)",
  organismDim: "rgba(130, 255, 240, 0.35)",
  telemetry: "#9fffd7",
  text: "#e6fff6",
  warning: "#ff4f7a",
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
  drawViewport(ctx, width, height, timeNow);
  drawCoralStructures(ctx, width, height, timeNow, scanParams, systemData);
  drawOrganisms(ctx, width, height, timeNow, scanParams);
  drawNutrientCurrents(ctx, width, height, timeNow, techParams, systemData);
  drawTelemetry(ctx, width, height, timeNow, scanParams, techParams, systemData);
  drawScanlines(ctx, width, height, timeNow);
}

function drawBackground(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#000710");
  gradient.addColorStop(1, colors.background);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawViewport(ctx, width, height, time) {
  ctx.save();
  const hexRadius = Math.min(width, height) * 0.42;
  const centerX = width / 2;
  const centerY = height * 0.5;

  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 6 + (Math.PI / 3) * i;
    const x = centerX + Math.cos(angle) * hexRadius;
    const y = centerY + Math.sin(angle) * hexRadius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  const innerGradient = ctx.createLinearGradient(centerX, centerY - hexRadius, centerX, centerY + hexRadius);
  innerGradient.addColorStop(0, "rgba(0, 120, 170, 0.25)");
  innerGradient.addColorStop(0.5, "rgba(0, 40, 60, 0.45)");
  innerGradient.addColorStop(1, "rgba(0, 20, 30, 0.8)");

  ctx.fillStyle = innerGradient;
  ctx.fill();

  ctx.lineWidth = 4;
  ctx.strokeStyle = `rgba(36, 140, 160, ${0.5 + 0.2 * Math.sin(time / 600)})`;
  ctx.stroke();

  ctx.strokeStyle = colors.viewportEdge;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 6]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawCoralStructures(ctx, width, height, time, scanParams, systemData) {
  ctx.save();
  const centerX = width / 2;
  const centerY = height * 0.5;
  const baseRadius = Math.min(width, height) * 0.36;
  const bloom = 1 + Math.sin(time / 500) * 0.08 * (scanParams.scanProgress + 0.2);

  const coralBranches = systemData?.coralNodes ?? 12;
  for (let i = 0; i < coralBranches; i++) {
    const angle = (i / coralBranches) * Math.PI * 2 + Math.sin(time / 1500 + i) * 0.1;
    const length = baseRadius * (0.5 + Math.sin(time / 800 + i) * 0.15);
    const wobble = Math.sin(time / 260 + i) * 8;

    ctx.beginPath();
    ctx.strokeStyle = colors.coralGlow;
    ctx.lineWidth = 2.4;
    ctx.moveTo(centerX + Math.cos(angle) * baseRadius * 0.4, centerY + Math.sin(angle) * baseRadius * 0.4);
    ctx.quadraticCurveTo(
      centerX + Math.cos(angle + wobble * 0.001) * baseRadius * 0.6,
      centerY + Math.sin(angle + wobble * 0.001) * baseRadius * 0.6,
      centerX + Math.cos(angle) * length * bloom,
      centerY + Math.sin(angle) * length * bloom
    );
    ctx.stroke();
  }

  ctx.globalAlpha = 0.6;
  ctx.strokeStyle = colors.aquaPulse;
  for (let r = 0; r < 6; r++) {
    const radius = baseRadius * (0.35 + r * 0.12) * bloom;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawOrganisms(ctx, width, height, time, scanParams) {
  ctx.save();
  const organismCount = 36;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.32;

  for (let i = 0; i < organismCount; i++) {
    const orbit = radius * (0.4 + ((i % 6) / 6) * 0.5);
    const speed = 0.0004 * (i + 6);
    const angle = time * speed + (i * Math.PI) / 9;
    const x = centerX + Math.cos(angle) * orbit;
    const y = centerY + Math.sin(angle) * orbit * 0.75;

    const pulse = Math.sin(time / 300 + i) * 0.3 + 0.7;
    const size = 3 + (i % 4);
    ctx.fillStyle = i % 3 === 0 ? colors.organism : colors.organismDim;
    ctx.globalAlpha = 0.4 + pulse * 0.5 * (scanParams.scanProgress + 0.5);
    ctx.beginPath();
    ctx.ellipse(x, y, size, size * 0.6, angle, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawNutrientCurrents(ctx, width, height, time, techParams, systemData) {
  ctx.save();
  const currents = systemData?.currents ?? 5;
  const energy = techParams.energyLevel ?? 0;
  const centerY = height / 2;

  for (let i = 0; i < currents; i++) {
    const y = centerY + Math.sin(time / 700 + i) * height * 0.2;
    const offset = Math.sin(time / 220 + i) * 30 * (energy / 10 + 0.6);

    ctx.strokeStyle = colors.nutrientCurrent;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.35 + (energy / 12 + 0.2) * 0.3;
    ctx.beginPath();
    ctx.moveTo(width * 0.15, y - offset);
    for (let x = width * 0.15; x <= width * 0.85; x += 24) {
      const wave = Math.sin(x / 60 + time / 500 + i) * 12;
      ctx.lineTo(x, y + wave);
    }
    ctx.stroke();

    ctx.strokeStyle = colors.aquaPulse;
    ctx.globalAlpha = 0.2 + (techParams.energyLevel ?? 0) * 0.02;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(width * 0.15, y - offset * 0.4);
    ctx.lineTo(width * 0.85, y - offset * 0.4);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTelemetry(ctx, width, height, time, scanParams, techParams, systemData) {
  ctx.save();
  const padding = 32;
  ctx.textAlign = "left";

  ctx.fillStyle = colors.text;
  ctx.font = `20px ${fonts.display}`;
  ctx.fillText("BIO-LUMINAL REEF MONITOR", padding, padding + 6);

  ctx.font = `13px ${fonts.mono}`;
  ctx.fillStyle = colors.telemetry;
  ctx.fillText(
    `SCAN RESONANCE: ${(scanParams.scanProgress * 100).toFixed(0)}%`,
    padding,
    padding + 30
  );
  ctx.fillText(
    `ENERGY FLUX: ${(techParams.energyLevel ?? 0).toFixed(1)}`,
    padding,
    padding + 48
  );

  const nutrient = (systemData?.nutrientFlow ?? 0.52) * 100;
  ctx.fillText(`NUTRIENT FLOW: ${nutrient.toFixed(1)}%`, padding, padding + 66);

  ctx.textAlign = "right";
  const stress = (systemData?.reefStress ?? 0.2) * 100;
  ctx.fillStyle = stress > 60 ? colors.warning : colors.telemetry;
  ctx.fillText(`REEF STRESS: ${stress.toFixed(1)}%`, width - padding, padding + 30);
  ctx.fillStyle = colors.telemetry;
  ctx.fillText(
    `BIOLUM DENSITY: ${((systemData?.bioDensity ?? 0.5) * 100).toFixed(1)}%`,
    width - padding,
    padding + 48
  );

  ctx.globalAlpha = 0.75;
  ctx.strokeStyle = "rgba(60, 160, 140, 0.4)";
  ctx.strokeRect(padding, height - 96, width - padding * 2, 58);
  ctx.globalAlpha = 1;

  const pulses = 18;
  const startX = padding + 14;
  const baseY = height - 48;
  const pulseWidth = (width - padding * 2 - 28) / pulses;
  for (let i = 0; i < pulses; i++) {
    const modulation = Math.sin(time / 260 + i * 0.45) * 0.5 + 0.5;
    const heightFactor = (systemData?.bioDensity ?? 0.5) * 30 + modulation * 22;
    ctx.fillStyle = `rgba(51, 246, 255, ${0.2 + i / pulses * 0.6})`;
    ctx.fillRect(startX + i * pulseWidth, baseY - heightFactor, pulseWidth * 0.6, heightFactor);
  }

  ctx.restore();
}

function drawScanlines(ctx, width, height, time) {
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = colors.scanline;
  const offset = (time / 26) % 4;
  for (let y = 0; y < height; y += 4) {
    ctx.fillRect(0, y + offset, width, 2);
  }
  ctx.restore();
}
