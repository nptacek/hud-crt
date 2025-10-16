const colors = {
  background: "#020018",
  orbitPath: "rgba(0, 255, 255, 0.35)",
  dock: "#ff00ff",
  vessel: "#00ffaa",
  beacon: "rgba(255, 170, 0, 0.7)",
  hud: "#00ffaa",
  accent: "rgba(0, 255, 255, 0.6)",
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
  void chromaticParams;
  const width = canvas.width;
  const height = canvas.height;
  const timeNow = Date.now();
  const orbitSpeed = (techParams?.energyLevel ?? 5) * 0.002;

  ctx.clearRect(0, 0, width, height);
  drawBackground(ctx, width, height);
  drawDock(ctx, width, height);
  drawOrbitingVessels(ctx, width, height, timeNow, orbitSpeed, systemData);
  drawHUD(ctx, width, height, timeNow, scanParams, systemData);
  drawScanlines(ctx, width, height, timeNow);
}

function drawBackground(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#01000f");
  gradient.addColorStop(1, "#05003a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255,255,255,0.2)";
  for (let i = 0; i < 80; i++) {
    const x = (i * 137 + 23) % width;
    const y = (i * 73 + 41) % height;
    const size = (i % 3) + 1;
    ctx.fillRect(x, y, size, size);
  }
}

function drawDock(ctx, width, height) {
  const centerX = width / 2;
  const centerY = height * 0.58;
  const outerRadius = Math.min(width, height) * 0.32;
  const innerRadius = outerRadius * 0.4;

  ctx.save();
  ctx.strokeStyle = colors.dock;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
  ctx.stroke();

  const spokeCount = 8;
  for (let i = 0; i < spokeCount; i++) {
    const angle = (Math.PI * 2 * i) / spokeCount;
    ctx.beginPath();
    ctx.moveTo(centerX + Math.cos(angle) * innerRadius, centerY + Math.sin(angle) * innerRadius);
    ctx.lineTo(centerX + Math.cos(angle) * outerRadius, centerY + Math.sin(angle) * outerRadius);
    ctx.stroke();
  }

  ctx.restore();
}

function drawOrbitingVessels(ctx, width, height, timeNow, orbitSpeed, systemData) {
  const centerX = width / 2;
  const centerY = height * 0.58;
  const orbits = systemData?.orbits ?? [
    { radius: width * 0.34, speed: 1.2, label: "ALPHA" },
    { radius: width * 0.26, speed: 0.8, label: "BETA" },
    { radius: width * 0.18, speed: 0.6, label: "GATE" },
  ];

  orbits.forEach((orbit, index) => {
    ctx.strokeStyle = colors.orbitPath;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, orbit.radius, 0, Math.PI * 2);
    ctx.stroke();

    const phase = orbit.speed * orbitSpeed * timeNow;
    const vesselX = centerX + Math.cos(phase) * orbit.radius;
    const vesselY = centerY + Math.sin(phase) * orbit.radius;

    ctx.fillStyle = colors.vessel;
    ctx.beginPath();
    ctx.arc(vesselX, vesselY, 6 + index, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.beacon;
    ctx.stroke();

    ctx.fillStyle = colors.hud;
    ctx.font = fonts.hud;
    ctx.textAlign = "center";
    ctx.fillText(orbit.label, vesselX, vesselY - 12);

    ctx.strokeStyle = colors.accent;
    ctx.beginPath();
    ctx.moveTo(vesselX, vesselY);
    ctx.lineTo(vesselX + Math.cos(phase + Math.PI / 2) * 18, vesselY + Math.sin(phase + Math.PI / 2) * 18);
    ctx.stroke();
  });
}

function drawHUD(ctx, width, height, timeNow, scanParams, systemData) {
  ctx.save();
  ctx.fillStyle = colors.hud;
  ctx.font = fonts.readout;
  ctx.textAlign = "left";
  ctx.fillText("STELLAR DOCK CONTROL", width * 0.08, height * 0.1 - 12);
  ctx.font = fonts.hud;
  ctx.fillText(`SCAN ${(scanParams?.scanProgress ?? 0).toFixed(2)}`, width * 0.08, height * 0.1 - 24);

  const statusX = width * 0.08;
  const statusY = height * 0.14;
  const statusSpacing = 20;
  const statuses = systemData?.status ?? [
    ["DOCK", "SYNCH"],
    ["AIRLOCK", "SEALED"],
    ["TRAJ", `${(Math.sin(timeNow / 600) * 2 + 12).toFixed(2)}°`],
  ];

  statuses.forEach((row, idx) => {
    ctx.fillText(`${row[0]} ${row[1]}`, statusX, statusY + idx * statusSpacing);
  });

  const gaugeX = width * 0.68;
  const gaugeY = height * 0.12;
  const gaugeWidth = width * 0.24;
  const gaugeHeight = height * 0.16;
  ctx.strokeStyle = colors.accent;
  ctx.strokeRect(gaugeX, gaugeY, gaugeWidth, gaugeHeight);

  ctx.beginPath();
  for (let i = 0; i <= 12; i++) {
    const x = gaugeX + (i / 12) * gaugeWidth;
    ctx.moveTo(x, gaugeY);
    ctx.lineTo(x, gaugeY + gaugeHeight);
  }
  ctx.strokeStyle = colors.orbitPath;
  ctx.stroke();

  const fill = (systemData?.dockingProgress ?? ((Math.sin(timeNow / 500) + 1) / 2));
  ctx.fillStyle = "rgba(0, 255, 255, 0.3)";
  ctx.fillRect(gaugeX, gaugeY + gaugeHeight * (1 - fill), gaugeWidth, gaugeHeight * fill);
  ctx.fillStyle = colors.hud;
  ctx.fillText(`ALIGN ${(fill * 100).toFixed(1)}%`, gaugeX, gaugeY - 8);

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
