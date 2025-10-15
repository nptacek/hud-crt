export const fonts = {
  primary: "'Courier New', 'Courier', monospace",
  header: "bold 'Courier New', 'Courier', monospace",
  terminal: "'Courier New', 'Courier', monospace",
  display: "'Courier New', 'Courier', monospace",
};

export function drawInterface(
  canvas,
  ctx,
  scanParams,
  techParams,
  chromaticParams,
  systemData
) {
  void chromaticParams;
  void systemData;

  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  const timeNow = Date.now();
  const centerX = width / 2;
  const centerY = height / 2 + 10;
  const sphereRadius = Math.min(width, height) * 0.22;
  const rotation = (timeNow / 1500) % (Math.PI * 2);
  const tilt = Math.sin(timeNow / 2600) * 0.45;

  const backgroundGradient = ctx.createLinearGradient(0, 0, 0, height);
  backgroundGradient.addColorStop(0, "#050f25");
  backgroundGradient.addColorStop(0.45, "#01040f");
  backgroundGradient.addColorStop(1, "#000000");
  ctx.fillStyle = backgroundGradient;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.fillStyle = "rgba(0, 255, 170, 0.55)";
  for (let i = 0; i < 80; i++) {
    const x = ((i * 53 + timeNow * 0.03) % width + width) % width;
    const y =
      ((i * 97 + Math.sin(timeNow / 700 + i) * 120 + height) % height + height) %
      height;
    const size = 1 + ((i % 5) / 5) * 1.6;
    ctx.globalAlpha = 0.2 + ((Math.sin(timeNow / 400 + i) + 1) / 2) * 0.4;
    ctx.fillRect(x, y, size, size);
  }
  ctx.restore();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = "rgba(0, 255, 238, 0.35)";
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, width - 32, height - 32);
  ctx.strokeStyle = "rgba(0, 140, 255, 0.25)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(26, 26, width - 52, height - 52);

  ctx.strokeStyle = "rgba(0, 255, 195, 0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(70, 122);
  ctx.lineTo(width - 70, 122);
  ctx.stroke();

  ctx.save();
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0, 255, 255, 0.75)";
  ctx.shadowBlur = 18;
  ctx.fillStyle = "#00fff6";
  ctx.font = `bold 46px ${fonts.display}`;
  ctx.fillText("HELLO WORLD", centerX, 80);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(0, 255, 170, 0.8)";
  ctx.font = `16px ${fonts.primary}`;
  ctx.fillText(
    "Signal uplink established • Quantum handshake verified",
    centerX,
    108
  );
  ctx.restore();

  ctx.save();
  ctx.translate(centerX, centerY);

  const halo = ctx.createRadialGradient(0, 0, sphereRadius * 0.2, 0, 0, sphereRadius * 1.6);
  halo.addColorStop(0, "rgba(0, 255, 200, 0.35)");
  halo.addColorStop(0.6, "rgba(0, 120, 255, 0.12)");
  halo.addColorStop(1, "rgba(0, 30, 60, 0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, sphereRadius * 1.4, 0, Math.PI * 2);
  ctx.fill();

  const depth = sphereRadius * 3.2;
  const project = (x, y, z) => {
    const perspective = depth / (depth + z);
    return { x: x * perspective, y: y * perspective };
  };

  const rotatePoint = (x, y, z) => {
    const cosR = Math.cos(rotation);
    const sinR = Math.sin(rotation);
    const xRot = x * cosR - z * sinR;
    const zRot = x * sinR + z * cosR;

    const cosT = Math.cos(tilt);
    const sinT = Math.sin(tilt);
    const yRot = y * cosT - zRot * sinT;
    const zTilt = y * sinT + zRot * cosT;

    return { x: xRot, y: yRot, z: zTilt };
  };

  ctx.lineWidth = 1.8;
  ctx.strokeStyle = "rgba(0, 255, 247, 0.65)";
  ctx.beginPath();
  ctx.arc(0, 0, sphereRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 1.1;
  for (let i = -4; i <= 4; i++) {
    const phi = (i / 4) * (Math.PI / 2);
    let first = true;
    ctx.beginPath();
    for (let theta = 0; theta <= Math.PI * 2 + 0.0001; theta += Math.PI / 60) {
      const x = sphereRadius * Math.cos(phi) * Math.cos(theta);
      const y = sphereRadius * Math.sin(phi);
      const z = sphereRadius * Math.cos(phi) * Math.sin(theta);
      const rotated = rotatePoint(x, y, z);
      const projected = project(rotated.x, rotated.y, rotated.z);
      if (first) {
        ctx.moveTo(projected.x, projected.y);
        first = false;
      } else {
        ctx.lineTo(projected.x, projected.y);
      }
    }
    ctx.globalAlpha = 0.22 + 0.1 * (1 - Math.abs(i) / 4);
    ctx.stroke();
  }

  const longitudeBands = 12;
  for (let j = 0; j < longitudeBands; j++) {
    const thetaBase = (j / longitudeBands) * Math.PI;
    let first = true;
    ctx.beginPath();
    for (let phi = -Math.PI / 2; phi <= Math.PI / 2 + 0.0001; phi += Math.PI / 60) {
      const x = sphereRadius * Math.cos(phi) * Math.cos(thetaBase);
      const y = sphereRadius * Math.sin(phi);
      const z = sphereRadius * Math.cos(phi) * Math.sin(thetaBase);
      const rotated = rotatePoint(x, y, z);
      const projected = project(rotated.x, rotated.y, rotated.z);
      if (first) {
        ctx.moveTo(projected.x, projected.y);
        first = false;
      } else {
        ctx.lineTo(projected.x, projected.y);
      }
    }
    ctx.globalAlpha = 0.25 + 0.05 * Math.sin(j + rotation);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  ctx.lineWidth = 2.6;
  ctx.strokeStyle = "rgba(0, 255, 170, 0.35)";
  ctx.setLineDash([10, 6]);
  ctx.beginPath();
  ctx.arc(0, 0, sphereRadius + 26, rotation, rotation + Math.PI * 1.2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "rgba(0, 255, 240, 0.85)";
  for (let k = 0; k < 4; k++) {
    const angle = rotation + (Math.PI / 2) * k;
    const nodeX = Math.cos(angle) * (sphereRadius + 26);
    const nodeY = Math.sin(angle) * (sphereRadius + 12) * 0.6;
    ctx.beginPath();
    ctx.arc(nodeX, nodeY, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  const progress = Math.max(0, Math.min(1, scanParams.scanProgress));
  ctx.save();
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(0, 255, 200, 0.6)";
  ctx.beginPath();
  ctx.arc(
    centerX,
    centerY,
    sphereRadius + 48,
    -Math.PI / 2,
    -Math.PI / 2 + Math.PI * 2 * progress
  );
  ctx.stroke();
  ctx.strokeStyle = "rgba(0, 90, 150, 0.4)";
  ctx.beginPath();
  ctx.arc(
    centerX,
    centerY,
    sphereRadius + 48,
    -Math.PI / 2 + Math.PI * 2 * progress,
    Math.PI * 1.5
  );
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(0, 255, 220, 0.8)";
  ctx.font = `18px ${fonts.terminal}`;
  ctx.fillText(
    `${Math.round(progress * 100)}% SYNCHRONIZATION`,
    centerX,
    centerY - sphereRadius - 60
  );
  ctx.restore();

  const infoPanelY = height - 160;
  const infoPanelHeight = 74;
  const infoPanelX = 70;
  const infoPanelWidth = width - infoPanelX * 2;
  ctx.fillStyle = "rgba(0, 40, 75, 0.45)";
  ctx.fillRect(infoPanelX, infoPanelY, infoPanelWidth, infoPanelHeight);
  ctx.strokeStyle = "rgba(0, 200, 255, 0.45)";
  ctx.lineWidth = 1.2;
  ctx.strokeRect(infoPanelX, infoPanelY, infoPanelWidth, infoPanelHeight);

  const segments = [
    { label: "EXPOSURE", value: `${techParams.exposureTime.toFixed(1)}s` },
    { label: "ENERGY", value: `${Math.round(techParams.energyLevel)} kV` },
    { label: "DEPTH", value: `${Math.round(techParams.insertionDepth)}%` },
    { label: "SCAN", value: `${Math.round(progress * 100)}%` },
  ];

  ctx.save();
  ctx.textAlign = "center";
  ctx.font = `12px ${fonts.primary}`;
  segments.forEach((segment, index) => {
    const segmentWidth = infoPanelWidth / segments.length;
    const segmentCenter = infoPanelX + segmentWidth * index + segmentWidth / 2;
    if (index > 0) {
      ctx.strokeStyle = "rgba(0, 120, 200, 0.35)";
      ctx.beginPath();
      ctx.moveTo(segmentCenter - segmentWidth / 2, infoPanelY + 10);
      ctx.lineTo(segmentCenter - segmentWidth / 2, infoPanelY + infoPanelHeight - 10);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(0, 180, 255, 0.65)";
    ctx.fillText(segment.label, segmentCenter, infoPanelY + 24);
    ctx.fillStyle = "#00ffaa";
    ctx.font = `bold 18px ${fonts.display}`;
    ctx.fillText(segment.value, segmentCenter, infoPanelY + 48);
    ctx.font = `12px ${fonts.primary}`;
  });
  ctx.restore();

  ctx.strokeStyle = "rgba(0, 255, 195, 0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(infoPanelX, infoPanelY + infoPanelHeight + 12);
  ctx.lineTo(infoPanelX + 80, infoPanelY + infoPanelHeight + 12);
  ctx.moveTo(width - infoPanelX, infoPanelY + infoPanelHeight + 12);
  ctx.lineTo(width - infoPanelX - 80, infoPanelY + infoPanelHeight + 12);
  ctx.stroke();

  ctx.save();
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0, 255, 170, 0.55)";
  ctx.shadowBlur = 14;
  ctx.fillStyle = "#00ffaa";
  ctx.font = `bold 34px ${fonts.display}`;
  ctx.fillText("WELCOME TO THE METAVERSE", centerX, height - 60);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(0, 210, 255, 0.65)";
  ctx.font = `18px ${fonts.terminal}`;
  ctx.fillText(
    "Synchronizing avatars • Rendering infinite horizons",
    centerX,
    height - 34
  );
  ctx.restore();

  ctx.textAlign = "left";
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1;
  ctx.shadowBlur = 0;
  ctx.setLineDash([]);
}
