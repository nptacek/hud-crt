const colors = {
  background: "#04010d",
  casing: "#0d0333",
  highlight: "#ff00ff",
  accent: "#00ffff",
  glow: "rgba(255, 0, 255, 0.4)",
  display: "#00ffaa",
  keypad: "#003355",
  keypadText: "#88f0ff",
  food: "#ffaa55",
  plate: "rgba(0, 255, 255, 0.4)",
  doorGrid: "rgba(0, 255, 200, 0.35)",
  scanline: "rgba(255, 255, 255, 0.05)",
};

const fonts = {
  display: "bold 18px 'Courier New', monospace",
  keypad: "14px 'Courier New', monospace",
  label: "12px 'Courier New', monospace",
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
  void scanParams;
  void techParams;
  void chromaticParams;
  const width = canvas.width;
  const height = canvas.height;
  const timeNow = Date.now();
  const rotation = (timeNow / 800) % (Math.PI * 2);

  ctx.clearRect(0, 0, width, height);
  drawBackground(ctx, width, height);
  drawMicrowaveChassis(ctx, width, height);
  drawInterior(ctx, width, height, rotation, systemData);
  drawControlPanel(ctx, width, height, timeNow, systemData);
  drawScanlines(ctx, width, height, timeNow);
}

function drawBackground(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#020008");
  gradient.addColorStop(1, "#050018");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawMicrowaveChassis(ctx, width, height) {
  const padding = width * 0.08;
  const chassisWidth = width - padding * 2;
  const chassisHeight = height * 0.75;
  const x = padding;
  const y = height * 0.08;

  ctx.save();
  ctx.strokeStyle = colors.highlight;
  ctx.lineWidth = 4;
  ctx.shadowColor = colors.glow;
  ctx.shadowBlur = 15;
  ctx.strokeRect(x, y, chassisWidth, chassisHeight);

  ctx.shadowBlur = 0;
  ctx.lineWidth = 2;
  ctx.strokeStyle = colors.accent;
  ctx.strokeRect(x + 8, y + 8, chassisWidth - 16, chassisHeight - 16);
  ctx.restore();
}

function drawInterior(ctx, width, height, rotation, systemData) {
  const padding = width * 0.12;
  const doorWidth = width * 0.6;
  const doorHeight = height * 0.55;
  const doorX = padding;
  const doorY = height * 0.16;

  ctx.save();
  ctx.fillStyle = "rgba(0, 10, 30, 0.9)";
  ctx.fillRect(doorX, doorY, doorWidth, doorHeight);

  // Door grid pattern
  ctx.strokeStyle = colors.doorGrid;
  ctx.lineWidth = 1;
  const gridSpacing = 18;
  for (let gx = doorX; gx <= doorX + doorWidth; gx += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(gx, doorY);
    ctx.lineTo(gx, doorY + doorHeight);
    ctx.stroke();
  }
  for (let gy = doorY; gy <= doorY + doorHeight; gy += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(doorX, gy);
    ctx.lineTo(doorX + doorWidth, gy);
    ctx.stroke();
  }

  // Rotating plate
  const centerX = doorX + doorWidth * 0.5;
  const centerY = doorY + doorHeight * 0.72;
  const plateRadius = doorWidth * 0.32;
  ctx.strokeStyle = colors.plate;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(centerX, centerY, plateRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation);
  ctx.strokeStyle = colors.plate;
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(plateRadius * 0.85, 0);
    ctx.stroke();
    ctx.rotate((Math.PI * 2) / 3);
  }

  // Food item represented as rotating prism
  ctx.fillStyle = colors.food;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.moveTo(plateRadius * 0.4, -plateRadius * 0.15);
  ctx.lineTo(plateRadius * 0.6, 0);
  ctx.lineTo(plateRadius * 0.4, plateRadius * 0.15);
  ctx.lineTo(-plateRadius * 0.4, plateRadius * 0.12);
  ctx.lineTo(-plateRadius * 0.6, 0);
  ctx.lineTo(-plateRadius * 0.4, -plateRadius * 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Heat waves
  ctx.strokeStyle = `rgba(255, 100, 100, 0.3)`;
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    const offset = Math.sin(rotation * 2 + i) * 6;
    ctx.beginPath();
    ctx.moveTo(centerX - plateRadius * 0.7 + i * 12, centerY - plateRadius * 0.8 + offset);
    ctx.quadraticCurveTo(
      centerX - plateRadius * 0.3 + i * 12,
      centerY - plateRadius * 1.2 + offset,
      centerX + plateRadius * 0.1 + i * 12,
      centerY - plateRadius * 0.9 + offset
    );
    ctx.stroke();
  }

  ctx.restore();
}

function drawControlPanel(ctx, width, height, timeNow, systemData) {
  const panelX = width * 0.75;
  const panelY = height * 0.16;
  const panelWidth = width * 0.17;
  const panelHeight = height * 0.55;

  ctx.save();
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 2;
  ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

  // Display window
  const displayHeight = panelHeight * 0.2;
  ctx.fillStyle = "rgba(0, 20, 30, 0.9)";
  ctx.fillRect(panelX + 12, panelY + 12, panelWidth - 24, displayHeight - 16);
  ctx.strokeStyle = colors.highlight;
  ctx.strokeRect(panelX + 12, panelY + 12, panelWidth - 24, displayHeight - 16);

  ctx.fillStyle = colors.display;
  ctx.font = fonts.display;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  const cycle = ((timeNow / 1000) % 60).toFixed(0).padStart(2, "0");
  const minutes = systemData?.cookMinutes ?? 1;
  ctx.fillText(`${minutes}:${cycle}`, panelX + panelWidth - 28, panelY + displayHeight / 2);

  // Status text
  ctx.textAlign = "left";
  ctx.font = fonts.label;
  ctx.fillStyle = colors.accent;
  ctx.fillText("MODE: NEON HEAT", panelX + 16, panelY + displayHeight + 20);
  ctx.fillText("ROTATION: ACTIVE", panelX + 16, panelY + displayHeight + 36);

  // Keypad grid
  const keypadCols = 3;
  const keypadRows = 4;
  const keyWidth = (panelWidth - 40) / keypadCols;
  const keyHeight = (panelHeight * 0.42) / keypadRows;
  const keypadTop = panelY + panelHeight * 0.4;

  const keypadLayout = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["START", "0", "STOP"],
  ];

  ctx.font = fonts.keypad;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let row = 0; row < keypadRows; row++) {
    for (let col = 0; col < keypadCols; col++) {
      const x = panelX + 20 + col * keyWidth;
      const y = keypadTop + row * keyHeight;
      ctx.fillStyle = colors.keypad;
      ctx.globalAlpha = 0.9;
      ctx.fillRect(x, y, keyWidth - 8, keyHeight - 10);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = colors.accent;
      ctx.strokeRect(x, y, keyWidth - 8, keyHeight - 10);
      const label = keypadLayout[row][col];
      const pulse = 0.5 + 0.5 * Math.sin((timeNow / 300) + row + col);
      ctx.fillStyle = `rgba(136, 240, 255, ${0.6 + pulse * 0.4})`;
      ctx.fillText(label, x + (keyWidth - 8) / 2, y + (keyHeight - 10) / 2);
    }
  }

  // Cooking progress meter
  const progress = (systemData?.heatLevel ?? 0.65) * 100;
  const barWidth = panelWidth - 24;
  const barY = panelY + panelHeight - 40;
  ctx.strokeStyle = colors.highlight;
  ctx.strokeRect(panelX + 12, barY, barWidth, 12);
  ctx.fillStyle = `rgba(255, 0, 120, 0.5)`;
  ctx.fillRect(panelX + 12, barY, (barWidth * progress) / 100, 12);
  ctx.fillStyle = colors.display;
  ctx.font = fonts.label;
  ctx.textAlign = "left";
  ctx.fillText(`THERMAL: ${progress.toFixed(0)}%`, panelX + 12, barY - 8);

  ctx.restore();
}

function drawScanlines(ctx, width, height, timeNow) {
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = colors.scanline;
  const scanOffset = (timeNow / 16) % 4;
  for (let y = -scanOffset; y < height; y += 4) {
    ctx.fillRect(0, y, width, 2);
  }
  ctx.restore();
}
