const colors = {
  background: "#020010",
  horizon: "#ff00ff",
  gridNear: "rgba(0, 255, 255, 0.8)",
  gridFar: "rgba(0, 255, 255, 0.2)",
  streak: "rgba(255, 0, 255, 0.6)",
  tower: "#00ffaa",
  ring: "rgba(255, 170, 0, 0.7)",
  text: "#00ffaa",
  scanline: "rgba(255, 255, 255, 0.05)",
};

const fonts = {
  hud: "16px 'Courier New', monospace",
  small: "12px 'Courier New', monospace",
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
  const speed = (techParams?.energyLevel ?? 6) * 0.6;

  ctx.clearRect(0, 0, width, height);
  drawBackground(ctx, width, height);
  drawSun(ctx, width, height, timeNow);
  drawGrid(ctx, width, height, timeNow, speed);
  drawTowers(ctx, width, height, timeNow);
  drawLightCycles(ctx, width, height, timeNow, speed, systemData);
  drawHUD(ctx, width, height, timeNow, scanParams, techParams);
  drawScanlines(ctx, width, height, timeNow);
}

function drawBackground(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#020010");
  gradient.addColorStop(0.4, "#080028");
  gradient.addColorStop(0.7, "#000018");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawSun(ctx, width, height, timeNow) {
  const centerX = width / 2;
  const centerY = height * 0.35;
  const radius = height * 0.12;
  ctx.save();
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
  gradient.addColorStop(0, "rgba(255, 180, 0, 0.9)");
  gradient.addColorStop(0.6, colors.horizon);
  gradient.addColorStop(1, "rgba(255, 0, 255, 0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 3;
  for (let i = -radius; i <= radius; i += 10) {
    const widthLine = Math.sqrt(radius * radius - i * i);
    ctx.beginPath();
    ctx.moveTo(centerX - widthLine, centerY + i);
    ctx.lineTo(centerX + widthLine, centerY + i);
    ctx.stroke();
  }

  const halo = 12 + Math.sin(timeNow / 500) * 6;
  ctx.strokeStyle = `rgba(255, 0, 255, 0.4)`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + halo, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawGrid(ctx, width, height, timeNow, speed) {
  const horizonY = height * 0.45;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, horizonY, width, height - horizonY);
  ctx.clip();

  const depthLines = 32;
  const spacing = height * 0.02;
  for (let i = 1; i < depthLines; i++) {
    const y = horizonY + (i * spacing + (timeNow * speed * 0.05)) % (height - horizonY);
    const alpha = 1 - i / depthLines;
    ctx.strokeStyle = `rgba(0, 255, 255, ${0.1 + alpha * 0.4})`;
    ctx.lineWidth = 1 + alpha * 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const vanishingPointX = width / 2;
  const columns = 18;
  for (let c = -columns; c <= columns; c++) {
    const x = (c / columns) * width * 0.8;
    ctx.strokeStyle = colors.gridFar;
    ctx.beginPath();
    ctx.moveTo(vanishingPointX + x, horizonY);
    ctx.lineTo(vanishingPointX + x * 0.15, height);
    ctx.stroke();
  }

  ctx.restore();
}

function drawTowers(ctx, width, height, timeNow) {
  const horizonY = height * 0.45;
  const baseWidth = width * 0.12;
  const jitter = Math.sin(timeNow / 700) * 8;

  for (let i = -2; i <= 2; i++) {
    const x = width / 2 + i * baseWidth * 1.4;
    const towerHeight = height * 0.2 + Math.sin(timeNow / 400 + i) * 20;
    ctx.save();
    ctx.translate(x, horizonY);
    ctx.strokeStyle = colors.tower;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-baseWidth / 3, 0);
    ctx.lineTo(-baseWidth / 4, -towerHeight);
    ctx.lineTo(baseWidth / 4, -towerHeight * 1.2);
    ctx.lineTo(baseWidth / 3, 0);
    ctx.closePath();
    ctx.stroke();

    const ringCount = 4;
    for (let r = 0; r < ringCount; r++) {
      const y = -towerHeight * 0.2 * r - jitter;
      ctx.strokeStyle = colors.ring;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, y, baseWidth * 0.35, baseWidth * 0.12, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawLightCycles(ctx, width, height, timeNow, speed, systemData) {
  const horizonY = height * 0.45;
  const cycleCount = systemData?.cycles ?? 3;
  for (let i = 0; i < cycleCount; i++) {
    const offset = (timeNow / (400 - i * 40)) % width;
    const x = (offset + i * width * 0.3) % width;
    const y = horizonY + height * 0.05 + i * 24;
    ctx.strokeStyle = colors.streak;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - speed * 25, y + Math.sin(timeNow / 200 + i) * 10);
    ctx.stroke();

    ctx.fillStyle = "rgba(0, 255, 255, 0.6)";
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHUD(ctx, width, height, timeNow, scanParams, techParams) {
  ctx.save();
  ctx.strokeStyle = colors.gridNear;
  ctx.strokeRect(width * 0.04, height * 0.06, width * 0.92, height * 0.88);

  ctx.fillStyle = colors.text;
  ctx.font = fonts.hud;
  ctx.textAlign = "left";
  ctx.fillText("TRON RUNNER SURVEILLANCE", width * 0.06, height * 0.12);
  ctx.font = fonts.small;
  ctx.fillText(`SCAN:${(scanParams?.scanProgress ?? 0).toFixed(2)}`, width * 0.06, height * 0.16);
  ctx.fillText(`ENERGY:${(techParams?.energyLevel ?? 0).toFixed(1)}`, width * 0.06, height * 0.2);

  const waveWidth = width * 0.3;
  const waveHeight = height * 0.12;
  const waveX = width * 0.65;
  const waveY = height * 0.12;
  ctx.strokeStyle = colors.tower;
  ctx.strokeRect(waveX, waveY, waveWidth, waveHeight);
  ctx.beginPath();
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const x = waveX + t * waveWidth;
    const y = waveY + waveHeight / 2 + Math.sin(timeNow / 200 + t * Math.PI * 4) * waveHeight * 0.4;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.fillText("VECTOR STREAM", waveX, waveY - 6);
  ctx.restore();
}

function drawScanlines(ctx, width, height, timeNow) {
  ctx.save();
  ctx.fillStyle = colors.scanline;
  const offset = (timeNow / 20) % 3;
  for (let y = -offset; y < height; y += 3) {
    ctx.fillRect(0, y, width, 1);
  }
  ctx.restore();
}
