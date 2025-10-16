const colors = {
  background: "#02030c",
  bezel: "#0a1030",
  textPrimary: "#00ffaa",
  textSecondary: "rgba(0, 255, 255, 0.7)",
  prompt: "#ff00ff",
  cursor: "#00ffff",
  panels: "rgba(0, 20, 40, 0.9)",
  border: "rgba(0, 255, 255, 0.6)",
  scanline: "rgba(255, 255, 255, 0.04)",
};

const fonts = {
  terminal: "15px 'Courier New', monospace",
  hud: "12px 'Courier New', monospace",
};

export { colors, fonts };

const commands = [
  { cmd: "cd /systems/relay", output: [] },
  { cmd: "ls", output: ["core.dat", "relay.cfg", "logs/", "scripts/"] },
  { cmd: "cat relay.cfg", output: [
      "[relay]",
      "frequency=8400MHz",
      "bandwidth=320MHz",
      "stability=97.4%"
    ]
  },
  { cmd: "./scripts/diagnose.sh", output: [
      "Initializing diagnostic...",
      "Link A: OK",
      "Link B: OK",
      "Thermal variance: 3.2%",
      "All systems nominal"
    ]
  },
];

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
  drawTerminal(ctx, width, height, timeNow, scanParams, systemData);
  drawSidebar(ctx, width, height, timeNow, systemData);
  drawScanlines(ctx, width, height, timeNow);
}

function drawBackground(ctx, width, height) {
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 3;
  ctx.strokeRect(width * 0.05, height * 0.08, width * 0.9, height * 0.84);
}

function drawTerminal(ctx, width, height, timeNow, scanParams, systemData) {
  const panelX = width * 0.12;
  const panelY = height * 0.14;
  const panelWidth = width * 0.62;
  const panelHeight = height * 0.72;

  ctx.save();
  ctx.fillStyle = colors.panels;
  ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 2;
  ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

  ctx.font = fonts.terminal;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  let lineY = panelY + 20;
  const lineHeight = 22;
  const activeIndex = Math.floor((timeNow / 2000) % commands.length);

  for (let i = 0; i < commands.length; i++) {
    const command = commands[i];
    ctx.fillStyle = colors.prompt;
    ctx.fillText(`neon@hud:${systemData?.cwd ?? "~"}$`, panelX + 16, lineY);
    ctx.fillStyle = colors.textPrimary;
    ctx.fillText(` ${command.cmd}`, panelX + 16 + 130, lineY);
    lineY += lineHeight;

    const isActive = i === activeIndex;
    const revealCount = isActive ? Math.min(Math.floor((timeNow / 120) % (command.output.length + 1)), command.output.length) : command.output.length;
    for (let o = 0; o < revealCount; o++) {
      const outputLine = command.output[o];
      ctx.fillStyle = colors.textSecondary;
      ctx.fillText(`> ${outputLine}`, panelX + 44, lineY);
      lineY += lineHeight;
    }

    if (isActive) {
      const cursorX = panelX + 16 + 130 + ctx.measureText(` ${command.cmd}`).width + 10;
      const cursorY = lineY - lineHeight;
      const blink = Math.sin(timeNow / 200) > 0 ? 1 : 0.2;
      ctx.fillStyle = `rgba(0, 255, 255, ${blink})`;
      ctx.fillRect(cursorX, cursorY, 10, 18);
    }
  }

  // status footer
  ctx.fillStyle = colors.textSecondary;
  ctx.fillText(
    `SCAN ${(scanParams?.scanProgress ?? 0).toFixed(2)}   LAT ${(systemData?.latency ?? 2.3).toFixed(1)}ms   PKT ${(systemData?.packetLoss ?? 0.01 * 100).toFixed(2)}%`,
    panelX + 16,
    panelY + panelHeight - 26
  );
  ctx.restore();
}

function drawSidebar(ctx, width, height, timeNow, systemData) {
  const sidebarX = width * 0.77;
  const sidebarY = height * 0.14;
  const sidebarWidth = width * 0.13;
  const sidebarHeight = height * 0.72;

  ctx.save();
  ctx.fillStyle = colors.panels;
  ctx.fillRect(sidebarX, sidebarY, sidebarWidth, sidebarHeight);
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 2;
  ctx.strokeRect(sidebarX, sidebarY, sidebarWidth, sidebarHeight);

  ctx.font = fonts.hud;
  ctx.textAlign = "left";
  ctx.fillStyle = colors.textSecondary;
  ctx.fillText("TERMINAL OPS", sidebarX + 12, sidebarY + 18);

  const meterCount = 5;
  const meterHeight = 32;
  for (let i = 0; i < meterCount; i++) {
    const meterY = sidebarY + 50 + i * (meterHeight + 12);
    const progress = 0.3 + 0.6 * Math.abs(Math.sin(timeNow / (400 + i * 70)));
    ctx.strokeStyle = colors.border;
    ctx.strokeRect(sidebarX + 12, meterY, sidebarWidth - 24, meterHeight);
    ctx.fillStyle = `rgba(0, 255, 255, 0.4)`;
    ctx.fillRect(sidebarX + 12, meterY, (sidebarWidth - 24) * progress, meterHeight);
    ctx.fillStyle = colors.textSecondary;
    const label = systemData?.meters?.[i]?.label ?? `CH-${i + 1}`;
    ctx.fillText(`${label}`, sidebarX + 12, meterY - 8);
  }

  ctx.restore();
}

function drawScanlines(ctx, width, height, timeNow) {
  ctx.save();
  ctx.fillStyle = colors.scanline;
  const offset = (timeNow / 22) % 4;
  for (let y = -offset; y < height; y += 4) {
    ctx.fillRect(0, y, width, 2);
  }
  ctx.restore();
}
