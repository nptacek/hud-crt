const colors = {
  background: "#010418",
  panel: "rgba(0, 20, 40, 0.85)",
  accent: "#ff00ff",
  text: "#00ffaa",
  cyclone: "rgba(0, 255, 255, 0.5)",
  front: "rgba(255, 170, 0, 0.6)",
  contour: "rgba(0, 255, 255, 0.2)",
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
  void techParams;
  void chromaticParams;
  const width = canvas.width;
  const height = canvas.height;
  const timeNow = Date.now();

  ctx.clearRect(0, 0, width, height);
  drawBackground(ctx, width, height);
  drawMapPanel(ctx, width, height, timeNow, systemData);
  drawOverlay(ctx, width, height, timeNow, scanParams, systemData);
  drawScanlines(ctx, width, height, timeNow);
}

function drawBackground(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#010414");
  gradient.addColorStop(1, "#04002a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawMapPanel(ctx, width, height, timeNow, systemData) {
  const panelX = width * 0.08;
  const panelY = height * 0.12;
  const panelWidth = width * 0.84;
  const panelHeight = height * 0.7;

  ctx.save();
  ctx.fillStyle = colors.panel;
  ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 2;
  ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

  ctx.beginPath();
  ctx.rect(panelX, panelY, panelWidth, panelHeight);
  ctx.clip();

  ctx.strokeStyle = colors.contour;
  for (let lat = -3; lat <= 3; lat++) {
    const y = panelY + panelHeight * ((lat + 3) / 6);
    ctx.beginPath();
    ctx.moveTo(panelX, y + Math.sin(lat + timeNow / 900) * 6);
    ctx.lineTo(panelX + panelWidth, y + Math.sin(lat + timeNow / 900) * 6);
    ctx.stroke();
  }
  for (let lon = 0; lon <= 6; lon++) {
    const x = panelX + panelWidth * (lon / 6);
    ctx.beginPath();
    ctx.moveTo(x + Math.sin(lon + timeNow / 700) * 4, panelY);
    ctx.lineTo(x + Math.sin(lon + timeNow / 700) * 4, panelY + panelHeight);
    ctx.stroke();
  }

  drawCyclone(ctx, panelX, panelY, panelWidth, panelHeight, timeNow, systemData);
  drawFront(ctx, panelX, panelY, panelWidth, panelHeight, timeNow, systemData);

  ctx.restore();
}

function drawCyclone(ctx, panelX, panelY, panelWidth, panelHeight, timeNow, systemData) {
  const centerX = panelX + panelWidth * (systemData?.cyclone?.x ?? 0.55);
  const centerY = panelY + panelHeight * (systemData?.cyclone?.y ?? 0.4);
  const maxRadius = panelWidth * 0.22;
  ctx.save();
  for (let i = 0; i < 6; i++) {
    const radius = maxRadius * (1 - i * 0.12);
    const rotation = timeNow / (800 - i * 60);
    ctx.strokeStyle = `rgba(0, 255, 255, ${0.4 - i * 0.05})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let angle = 0; angle <= Math.PI * 2; angle += Math.PI / 24) {
      const offset = Math.sin(angle * 3 + rotation) * 6;
      const x = centerX + Math.cos(angle + rotation / 6) * (radius + offset);
      const y = centerY + Math.sin(angle + rotation / 6) * (radius + offset);
      if (angle === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
}

function drawFront(ctx, panelX, panelY, panelWidth, panelHeight, timeNow, systemData) {
  const points = systemData?.front ?? [
    { x: 0.1, y: 0.8 },
    { x: 0.24, y: 0.72 },
    { x: 0.45, y: 0.75 },
    { x: 0.7, y: 0.6 },
    { x: 0.88, y: 0.52 },
  ];

  ctx.save();
  ctx.strokeStyle = colors.front;
  ctx.lineWidth = 3;
  ctx.beginPath();
  points.forEach((point, index) => {
    const x = panelX + panelWidth * point.x + Math.sin(timeNow / 900 + index) * 4;
    const y = panelY + panelHeight * point.y + Math.cos(timeNow / 800 + index) * 3;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  points.forEach((point, index) => {
    const x = panelX + panelWidth * point.x;
    const y = panelY + panelHeight * point.y;
    ctx.fillStyle = colors.front;
    ctx.beginPath();
    ctx.arc(x, y, 6 + Math.sin(timeNow / 500 + index) * 2, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawOverlay(ctx, width, height, timeNow, scanParams, systemData) {
  ctx.save();
  ctx.fillStyle = colors.text;
  ctx.font = fonts.readout;
  ctx.textAlign = "left";
  ctx.fillText("WEATHER ATLAS", width * 0.08, height * 0.1 - 12);
  ctx.font = fonts.hud;
  ctx.fillText(`SCAN ${(scanParams?.scanProgress ?? 0).toFixed(2)}`, width * 0.08, height * 0.1 - 26);

  const legendX = width * 0.68;
  const legendY = height * 0.12;
  const legendWidth = width * 0.24;
  const legendHeight = height * 0.18;
  ctx.strokeStyle = colors.accent;
  ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);

  const legendItems = [
    [colors.cyclone, "Cyclone Spiral"],
    [colors.front, "Thermal Front"],
    [colors.contour, "Jetstream Contours"],
  ];

  legendItems.forEach((item, index) => {
    const y = legendY + 20 + index * 32;
    ctx.fillStyle = item[0];
    ctx.fillRect(legendX + 16, y, 24, 12);
    ctx.fillStyle = colors.text;
    ctx.fillText(item[1], legendX + 48, y + 10);
  });

  const temperature = systemData?.temperature ?? 24 + Math.sin(timeNow / 600) * 6;
  const humidity = systemData?.humidity ?? 68 + Math.cos(timeNow / 700) * 8;
  ctx.fillText(`TEMP ${temperature.toFixed(1)}°`, legendX, legendY + legendHeight + 20);
  ctx.fillText(`HUM ${(humidity).toFixed(0)}%`, legendX, legendY + legendHeight + 36);

  ctx.restore();
}

function drawScanlines(ctx, width, height, timeNow) {
  ctx.save();
  ctx.fillStyle = colors.scanline;
  const offset = (timeNow / 20) % 4;
  for (let y = -offset; y < height; y += 4) {
    ctx.fillRect(0, y, width, 2);
  }
  ctx.restore();
}
