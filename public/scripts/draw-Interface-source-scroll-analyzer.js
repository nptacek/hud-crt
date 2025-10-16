const colors = {
  background: "#030015",
  panel: "rgba(0, 20, 40, 0.9)",
  accent: "#ff00ff",
  textPrimary: "#00ffaa",
  textSecondary: "rgba(0, 255, 255, 0.7)",
  cursor: "rgba(0, 255, 255, 0.8)",
  scanline: "rgba(255, 255, 255, 0.04)",
};

const fonts = {
  code: "14px 'Courier New', monospace",
  hud: "12px 'Courier New', monospace",
  label: "11px 'Courier New', monospace",
};

export { colors, fonts };

const snippet = `function drawScene(ctx, width, height, time) {\n  const horizon = height * 0.42;\n  drawGradient(ctx, width, height);\n  drawGrid(ctx, width, height, time);\n  drawActors(ctx, time);\n  drawHud(ctx, horizon, time);\n}\n\nfunction drawActors(ctx, time) {\n  const pulse = Math.sin(time / 200);\n  ctx.fillStyle = 'rgba(0, 255, 255, 0.6)';\n  ctx.beginPath();\n  ctx.arc(120 + pulse * 12, 90, 18, 0, Math.PI * 2);\n  ctx.fill();\n  ctx.strokeStyle = '#ff00ff';\n  ctx.stroke();\n}`;

const snippetLines = snippet.split("\n");

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
  drawPanel(ctx, width, height);
  drawCode(ctx, width, height, timeNow, scanParams, systemData);
  drawOverlay(ctx, width, height, timeNow, scanParams);
  drawScanlines(ctx, width, height, timeNow);
}

function drawBackground(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#01000c");
  gradient.addColorStop(1, "#04002a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawPanel(ctx, width, height) {
  ctx.save();
  ctx.fillStyle = colors.panel;
  ctx.fillRect(width * 0.08, height * 0.1, width * 0.84, height * 0.8);
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 2;
  ctx.strokeRect(width * 0.08, height * 0.1, width * 0.84, height * 0.8);
  ctx.restore();
}

function drawCode(ctx, width, height, timeNow, scanParams, systemData) {
  const panelX = width * 0.12;
  const panelY = height * 0.15;
  const panelWidth = width * 0.76;
  const panelHeight = height * 0.66;
  const lineHeight = 20;
  const totalLines = snippetLines.length;
  const scrollSpeed = (systemData?.scrollSpeed ?? 1.5) * (1 + (scanParams?.scanProgress ?? 0));
  const scrollOffset = (timeNow / 120) * scrollSpeed;
  const startLine = Math.floor((scrollOffset / lineHeight) % totalLines);
  const fractional = (scrollOffset % lineHeight);

  ctx.save();
  ctx.beginPath();
  ctx.rect(panelX, panelY, panelWidth, panelHeight);
  ctx.clip();

  ctx.font = fonts.code;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  for (let i = 0; i < totalLines + 6; i++) {
    const lineIndex = (startLine + i) % totalLines;
    const line = snippetLines[lineIndex];
    const y = panelY + i * lineHeight - fractional;
    ctx.fillStyle = colors.textSecondary;
    ctx.fillText(line.padEnd(80, " "), panelX + 16, y);
    ctx.fillStyle = `rgba(255, 0, 255, ${0.12 + (lineIndex % 5) * 0.05})`;
    ctx.fillRect(panelX + 8, y + lineHeight - 4, panelWidth - 16, 1);
  }

  const caretLineIndex = (startLine + 2) % totalLines;
  const caretLine = snippetLines[caretLineIndex];
  const caretX = panelX + 16 + ctx.measureText(caretLine.slice(0, 18)).width;
  const caretY = panelY + 2 * lineHeight - fractional;
  const blink = Math.sin(timeNow / 180) > 0 ? 1 : 0.2;
  ctx.fillStyle = `rgba(0, 255, 255, ${blink})`;
  ctx.fillRect(caretX, caretY, 8, lineHeight - 4);

  ctx.restore();
}

function drawOverlay(ctx, width, height, timeNow, scanParams) {
  ctx.save();
  ctx.fillStyle = colors.accent;
  ctx.font = fonts.hud;
  ctx.textAlign = "left";
  ctx.fillText("SOURCE VIEWER", width * 0.1, height * 0.1 - 10);
  ctx.fillText(`SCROLL ${(scanParams?.scanProgress ?? 0).toFixed(2)}`, width * 0.1, height * 0.1 - 24);

  const miniWidth = width * 0.24;
  const miniHeight = height * 0.22;
  const miniX = width * 0.68;
  const miniY = height * 0.12;

  ctx.strokeStyle = colors.accent;
  ctx.strokeRect(miniX, miniY, miniWidth, miniHeight);
  ctx.fillStyle = "rgba(0, 255, 255, 0.08)";
  ctx.fillRect(miniX, miniY, miniWidth, miniHeight);

  ctx.strokeStyle = colors.textPrimary;
  ctx.beginPath();
  ctx.moveTo(miniX + 12, miniY + miniHeight - 12);
  ctx.lineTo(miniX + miniWidth * 0.6, miniY + miniHeight * 0.3);
  ctx.lineTo(miniX + miniWidth - 12, miniY + miniHeight - 18);
  ctx.stroke();

  const indicatorY = miniY + (miniHeight * ((Math.sin(timeNow / 400) + 1) / 2));
  ctx.strokeStyle = colors.cursor;
  ctx.strokeRect(miniX + miniWidth - 18, indicatorY - 10, 12, 20);
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
