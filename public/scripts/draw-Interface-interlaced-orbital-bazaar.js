const colors = {
  background: "#04100f",
  grid: "rgba(0, 140, 90, 0.4)",
  gridGlow: "rgba(0, 200, 130, 0.2)",
  orbitLane: "rgba(140, 0, 255, 0.55)",
  tradeAlert: "#ffb347",
  vendorGlyph: "#ffeead",
  tickerText: "#c8ffea",
  warning: "#ff5370",
  scanline: "rgba(255, 255, 255, 0.04)",
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
  drawMarketGrid(ctx, width, height, timeNow);
  drawOrbitalMap(ctx, width, height, timeNow, scanParams, techParams, systemData);
  drawTicker(ctx, width, height, timeNow, systemData);
  drawTelemetry(ctx, width, height, scanParams, techParams, systemData);
  drawScanlines(ctx, width, height, timeNow);
}

function drawBackground(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#020806");
  gradient.addColorStop(1, colors.background);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawMarketGrid(ctx, width, height, time) {
  ctx.save();
  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1;
  const spacing = 40;
  const offset = (time / 240) % spacing;

  for (let x = -spacing; x < width + spacing; x += spacing) {
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(x + offset, 0);
    ctx.lineTo(x + offset, height);
    ctx.stroke();
  }

  for (let y = -spacing; y < height + spacing; y += spacing) {
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(0, y + offset);
    ctx.lineTo(width, y + offset);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.strokeStyle = colors.gridGlow;
  ctx.lineWidth = 2;
  ctx.strokeRect(width * 0.1, height * 0.12, width * 0.8, height * 0.76);
  ctx.restore();
}

function drawOrbitalMap(ctx, width, height, time, scanParams, techParams, systemData) {
  ctx.save();
  const centerX = width / 2;
  const centerY = height * 0.48;
  const baseRadius = Math.min(width, height) * 0.3;
  const energy = techParams.energyLevel ?? 0;

  ctx.strokeStyle = colors.orbitLane;
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 2 + energy * 0.1;
  for (let i = 0; i < 5; i++) {
    const radius = baseRadius * (0.45 + i * 0.12);
    const wobble = Math.sin(time / 600 + i) * 6 * (energy / 8 + 0.4);
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radius + wobble, (radius + wobble) * 0.7, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  const docks = systemData?.docks ?? 10;
  for (let i = 0; i < docks; i++) {
    const orbitRadius = baseRadius * (0.5 + (i % 4) * 0.15);
    const angle = time * 0.0003 * (techParams.energyLevel + 6) + (i * Math.PI * 2) / docks;
    const x = centerX + Math.cos(angle) * orbitRadius;
    const y = centerY + Math.sin(angle) * orbitRadius * 0.7;
    ctx.fillStyle = colors.vendorGlyph;
    ctx.globalAlpha = 0.6 + 0.4 * Math.sin(time / 180 + i);
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  const tradeVolume = systemData?.tradeVolume ?? 0;
  const volumeScale = Math.min(1, tradeVolume / 1000);
  const arcLength = Math.PI * (0.6 + scanParams.scanProgress * 1.2);
  ctx.strokeStyle = colors.tradeAlert;
  ctx.globalAlpha = 0.5 + volumeScale * 0.5;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(centerX, centerY, baseRadius * 1.1, -Math.PI / 2, -Math.PI / 2 + arcLength);
  ctx.stroke();

  ctx.restore();
}

function drawTicker(ctx, width, height, time, systemData) {
  ctx.save();
  const tickerHeight = 46;
  const y = height - tickerHeight;
  ctx.fillStyle = "rgba(0, 30, 20, 0.8)";
  ctx.fillRect(0, y, width, tickerHeight);
  ctx.strokeStyle = colors.grid;
  ctx.strokeRect(0, y, width, tickerHeight);

  const entries = systemData?.ticker ?? [
    { label: "NODE-01", value: "+12%" },
    { label: "NODE-07", value: "-4%" },
    { label: "DOCK-ALFA", value: "+32%" },
    { label: "NODE-12", value: "+5%" },
  ];

  ctx.font = `14px ${fonts.mono}`;
  ctx.fillStyle = colors.tickerText;
  const scrollSpeed = 80;
  const offset = ((time / 1000) * scrollSpeed) % (width * 2);

  for (let i = 0; i < entries.length * 2; i++) {
    const index = i % entries.length;
    const item = entries[index];
    const text = `${item.label} ${item.value}`;
    const textWidth = ctx.measureText(text).width + 60;
    const x = width - offset + i * textWidth;
    ctx.globalAlpha = 0.6 + 0.4 * Math.sin(time / 200 + i);
    ctx.fillText(text, x, y + tickerHeight / 2 + 5);
  }

  ctx.restore();
}

function drawTelemetry(ctx, width, height, scanParams, techParams, systemData) {
  const padding = 28;
  ctx.save();
  ctx.textAlign = "left";
  ctx.fillStyle = colors.tickerText;
  ctx.font = `20px ${fonts.display}`;
  ctx.fillText("INTERLACED ORBITAL BAZAAR", padding, padding + 6);

  ctx.font = `13px ${fonts.mono}`;
  ctx.fillStyle = colors.tickerText;
  ctx.fillText(
    `SCAN STATUS: ${(scanParams.scanProgress * 100).toFixed(0)}%`,
    padding,
    padding + 28
  );
  ctx.fillText(
    `ENERGY LEVEL: ${(techParams.energyLevel ?? 0).toFixed(1)}`,
    padding,
    padding + 44
  );
  ctx.fillText(
    `TRADE VOLUME: ${(systemData?.tradeVolume ?? 0).toLocaleString()} units`,
    padding,
    padding + 60
  );

  ctx.textAlign = "right";
  ctx.fillStyle = colors.tickerText;
  ctx.fillText(
    `LANE DENSITY: ${((systemData?.laneDensity ?? 0.3) * 100).toFixed(1)}%`,
    width - padding,
    padding + 28
  );
  ctx.fillText(
    `ALERTS ACTIVE: ${systemData?.alerts ?? 0}`,
    width - padding,
    padding + 44
  );
  ctx.fillStyle = systemData?.alerts ? colors.warning : colors.tickerText;
  ctx.fillText(
    systemData?.alerts ? "MARKET STATUS: UNSTABLE" : "MARKET STATUS: STABLE",
    width - padding,
    padding + 60
  );

  ctx.strokeStyle = "rgba(0, 200, 120, 0.35)";
  ctx.globalAlpha = 0.8;
  ctx.strokeRect(padding, height * 0.14, width - padding * 2, height * 0.68);
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawScanlines(ctx, width, height, time) {
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = colors.scanline;
  const offset = (time / 32) % 4;
  for (let y = 0; y < height; y += 4) {
    ctx.fillRect(0, y + offset, width, 2);
  }
  ctx.restore();
}
