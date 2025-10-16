const colors = {
  background: "#010712",
  columnTop: "#00ffaa",
  columnTail: "rgba(0, 255, 255, 0.3)",
  glyphBright: "#00ffff",
  glyphDim: "rgba(0, 255, 255, 0.4)",
  hud: "#ff00ff",
  text: "#00ffaa",
  scanline: "rgba(255, 255, 255, 0.04)",
};

const fonts = {
  glyph: "16px 'Courier New', monospace",
  hud: "12px 'Courier New', monospace",
};

export { colors, fonts };

const glyphs = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>[]{}+-=*/\\";

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
  drawMatrixColumns(ctx, width, height, timeNow, scanParams, techParams, systemData);
  drawHUD(ctx, width, height, timeNow, scanParams, techParams);
  drawScanlines(ctx, width, height, timeNow);
}

function drawBackground(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#000010");
  gradient.addColorStop(1, "#020022");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawMatrixColumns(ctx, width, height, timeNow, scanParams, techParams, systemData) {
  const columnCount = 32;
  const columnWidth = width / columnCount;
  const baseSpeed = (techParams?.energyLevel ?? 4) * 0.15;
  const variance = systemData?.glyphVariance ?? 0.4;

  for (let c = 0; c < columnCount; c++) {
    const columnX = c * columnWidth;
    const speed = baseSpeed + (Math.sin(c * 0.8 + timeNow / 900) + 1) * variance;
    const offset = (timeNow * speed) % height;
    const glyphCount = Math.ceil(height / 18) + 2;

    for (let g = 0; g < glyphCount; g++) {
      const y = ((g * 18) + offset) % height;
      const charIndex = Math.floor((c * 31 + g + Math.floor(timeNow / 120)) % glyphs.length);
      const glyph = glyphs[charIndex];
      const brightness = 0.4 + Math.sin((timeNow / 200) + g * 0.4 + c * 0.2) * 0.3;

      ctx.font = fonts.glyph;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      if (g === 0) {
        ctx.fillStyle = colors.columnTop;
      } else if (g < 4) {
        ctx.fillStyle = `rgba(0, 255, 255, ${0.4 + brightness * 0.4})`;
      } else {
        ctx.fillStyle = `rgba(0, 255, 255, ${0.15 + brightness * 0.25})`;
      }
      ctx.fillText(glyph, columnX + columnWidth / 2, y - 18);
    }

    // column tail glow
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(0, 255, 255, 0.2)");
    gradient.addColorStop(1, "rgba(0, 255, 255, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(columnX, 0, columnWidth, height);
  }
}

function drawHUD(ctx, width, height, timeNow, scanParams, techParams) {
  ctx.save();
  ctx.strokeStyle = colors.hud;
  ctx.lineWidth = 2;
  ctx.strokeRect(width * 0.05, height * 0.08, width * 0.9, height * 0.84);

  ctx.fillStyle = colors.text;
  ctx.font = fonts.hud;
  ctx.textAlign = "left";
  ctx.fillText("NEON MATRIX DESCENT", width * 0.07, height * 0.12);
  ctx.fillText(`SCAN:${(scanParams?.scanProgress ?? 0).toFixed(3)}`, width * 0.07, height * 0.16);
  ctx.fillText(`FLOW:${(techParams?.energyLevel ?? 0).toFixed(2)}`, width * 0.07, height * 0.2);

  const waveformWidth = width * 0.3;
  const waveformHeight = height * 0.1;
  const waveformX = width * 0.62;
  const waveformY = height * 0.12;
  ctx.strokeStyle = colors.text;
  ctx.strokeRect(waveformX, waveformY, waveformWidth, waveformHeight);
  ctx.beginPath();
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const x = waveformX + t * waveformWidth;
    const y = waveformY + waveformHeight / 2 + Math.sin(timeNow / 220 + t * Math.PI * 6) * waveformHeight * 0.4;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawScanlines(ctx, width, height, timeNow) {
  ctx.save();
  ctx.fillStyle = colors.scanline;
  const offset = (timeNow / 18) % 4;
  for (let y = -offset; y < height; y += 4) {
    ctx.fillRect(0, y, width, 2);
  }
  ctx.restore();
}
