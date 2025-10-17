export const colors = {
    background: "#020416",
    midnight: "#030b24",
    auroraBlue: "#2bc3ff",
    auroraMagenta: "#ff66ff",
    auroraGreen: "#3cffd0",
    white: "#f5f7ff",
    icyCyan: "rgba(160, 240, 255, 0.6)",
    polarGlow: "rgba(126, 216, 255, 0.35)",
    panelFill: "rgba(10, 40, 80, 0.35)",
    panelOutline: "rgba(120, 200, 255, 0.65)",
    gridLines: "rgba(90, 180, 255, 0.25)",
    waypoint: "#ffd6ff",
    ribbon: "rgba(255, 102, 255, 0.5)",
    caution: "#ffcc66",
    success: "#66ffcc",
};

export const fonts = {
    primary: "'Courier New', 'Courier', monospace",
    header: "bold 16px 'Courier New', 'Courier', monospace",
    terminal: "12px 'Courier New', 'Courier', monospace",
    micro: "10px 'Courier New', 'Courier', monospace",
};

export function drawInterface(
    canvas,
    ctx,
    scanParams,
    techParams,
    chromaticParams,
    systemData
) {
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const timeNow = Date.now();

    drawPolarBackground(ctx, width, height, timeNow);
    drawParallaxFloor(ctx, width, height, timeNow, scanParams);

    const horizonY = height * 0.42;
    drawAuroraCones(ctx, centerX, horizonY, width, height, timeNow, scanParams);
    drawLatticeRoutes(ctx, centerX, horizonY, width, height, timeNow, systemData, scanParams);
    drawCompassPetals(ctx, centerX, horizonY + 40, timeNow, techParams);

    drawFloatingPanels(ctx, width, height, timeNow, systemData, techParams);
    drawTelemetryTicker(ctx, width, height, timeNow, systemData, scanParams, techParams);
}

function drawPolarBackground(ctx, width, height, time) {
    const gradient = ctx.createRadialGradient(
        width / 2,
        height * 0.2,
        width * 0.1,
        width / 2,
        height / 2,
        width * 0.9
    );
    gradient.addColorStop(0, "#09203f");
    gradient.addColorStop(0.6, colors.midnight);
    gradient.addColorStop(1, colors.background);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = 1;
    const starDensity = 120;
    for (let i = 0; i < starDensity; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height * 0.5;
        const flicker = 0.4 + 0.6 * Math.sin(time / 1000 + x * 0.05 + y * 0.02);
        ctx.globalAlpha = flicker;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 0.5, y + 0.5);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

function drawParallaxFloor(ctx, width, height, time, scanParams) {
    const depthLayers = 4;
    const baseY = height * 0.6;
    const vanishingX = width / 2;
    const vanishingY = baseY - height * 0.35;
    const progress = (scanParams?.scanProgress ?? 0) % 1;

    for (let layer = 0; layer < depthLayers; layer++) {
        const opacity = 0.35 - layer * 0.05;
        const color = `rgba(80, 150, 255, ${opacity})`;
        const speed = 0.4 + layer * 0.2;
        const offset = ((time / 4000) * speed + progress * 2) % 1;
        const spacing = 40 + layer * 20;

        ctx.strokeStyle = color;
        ctx.lineWidth = 1;

        for (let i = -2; i < width / spacing + 4; i++) {
            const x = ((i + offset) * spacing) % (width + spacing) - spacing;
            ctx.beginPath();
            ctx.moveTo(x, baseY);
            ctx.lineTo(vanishingX, vanishingY);
            ctx.stroke();
        }

        const horizontalCount = 6;
        for (let j = 1; j <= horizontalCount; j++) {
            const y = baseY + j * 30 + layer * 20;
            ctx.globalAlpha = Math.max(0, 0.35 - j * 0.05 - layer * 0.05);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }
}

function drawAuroraCones(ctx, centerX, horizonY, width, height, time, scanParams) {
    const layers = 5;
    const progress = scanParams?.scanProgress ?? 0;

    for (let i = 0; i < layers; i++) {
        const t = (i / layers) * Math.PI * 2;
        const wobble = Math.sin(time / 1200 + t * 3) * 0.2;
        const radius = width * (0.3 + i * 0.07 + wobble * 0.05);
        const topY = horizonY - height * (0.35 + 0.05 * i * (1 + progress));
        const baseY = horizonY + height * 0.4;

        const gradient = ctx.createLinearGradient(centerX, topY, centerX, baseY);
        gradient.addColorStop(0, `rgba(43, 195, 255, ${0.3 - i * 0.03})`);
        gradient.addColorStop(0.5, `rgba(255, 102, 255, ${0.2 - i * 0.02})`);
        gradient.addColorStop(1, `rgba(60, 255, 208, ${0.12 - i * 0.015})`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(centerX - radius * 0.2, baseY);
        ctx.quadraticCurveTo(centerX, topY, centerX + radius * 0.2, baseY);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = `rgba(160, 240, 255, ${0.4 - i * 0.05})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX, topY);
        ctx.lineTo(centerX, baseY);
        ctx.stroke();
    }
}

function drawLatticeRoutes(ctx, centerX, horizonY, width, height, time, systemData, scanParams) {
    const routes = systemData?.routes ?? [
        { name: "POLAR RUN", distance: "3.4 AU", risk: "LOW", eta: "02:15", entanglement: 0.7 },
        { name: "ION VEIL", distance: "5.1 AU", risk: "MODERATE", eta: "05:40", entanglement: 0.42 },
        { name: "NEBULA FJORD", distance: "7.9 AU", risk: "ELEV", eta: "08:32", entanglement: 0.9 },
    ];
    const scan = scanParams?.scanProgress ?? 0;

    routes.forEach((route, idx) => {
        const angle = (-Math.PI / 4) + (idx / Math.max(routes.length - 1, 1)) * (Math.PI / 2);
        const radius = width * (0.22 + idx * 0.12);
        const startX = centerX;
        const startY = horizonY;
        const endX = centerX + Math.cos(angle) * radius;
        const endY = horizonY - Math.sin(angle) * radius * 0.7;

        ctx.strokeStyle = `rgba(160, 240, 255, ${0.6 - idx * 0.08})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        const ribbonSegments = 40;
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = `rgba(255, 102, 255, ${0.4 - idx * 0.05})`;
        ctx.beginPath();
        for (let i = 0; i <= ribbonSegments; i++) {
            const pct = i / ribbonSegments;
            const wobble = Math.sin(time / 400 + pct * 10 + idx) * 6;
            const x = startX + (endX - startX) * pct + wobble;
            const y = startY + (endY - startY) * pct - wobble * 0.3;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        const waypointPulse = 4 + Math.sin(time / 300 + idx * 1.3 + scan * 6) * 2;
        ctx.fillStyle = colors.waypoint;
        ctx.beginPath();
        ctx.arc(endX, endY, 6 + waypointPulse * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(60, 255, 208, ${0.4})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(endX, endY, 10 + waypointPulse, 0, Math.PI * 2);
        ctx.stroke();

        drawRoutePlaque(ctx, endX, endY - 35, route, idx, scan);
    });
}

function drawRoutePlaque(ctx, x, y, route, idx, scan) {
    const width = 160;
    const height = 70;
    const offsetX = idx % 2 === 0 ? -width - 20 : 20;

    ctx.fillStyle = colors.panelFill;
    ctx.strokeStyle = colors.panelOutline;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    drawRoundedRectPath(ctx, x + offsetX, y, width, height, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = `bold 12px ${fonts.primary}`;
    ctx.fillStyle = colors.white;
    ctx.fillText(route.name, x + offsetX + 12, y + 18);

    ctx.font = fonts.terminal;
    ctx.fillStyle = colors.icyCyan;
    ctx.fillText(`DIST ${route.distance}`, x + offsetX + 12, y + 36);
    ctx.fillText(`ETA ${route.eta}`, x + offsetX + 12, y + 50);

    ctx.fillStyle = route.risk.includes("ELEV") ? colors.caution : colors.success;
    ctx.fillText(`RISK ${route.risk}`, x + offsetX + 12, y + 64);

    const entanglement = route.entanglement ?? 0;
    const barWidth = width - 40;
    const filled = barWidth * entanglement * (0.6 + 0.4 * scan);

    ctx.strokeStyle = colors.auroraMagenta;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + offsetX + 12, y + height - 18, barWidth, 6);

    ctx.fillStyle = colors.auroraMagenta;
    ctx.fillRect(x + offsetX + 12, y + height - 18, filled, 6);
}

function drawCompassPetals(ctx, x, y, time, techParams) {
    const petals = 16;
    const baseRadius = 60;
    const drift = (techParams?.orientationOffset ?? 0) * Math.PI * 2;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(drift + Math.sin(time / 4000) * 0.1);

    for (let i = 0; i < petals; i++) {
        const angle = (Math.PI * 2 * i) / petals;
        const length = baseRadius + Math.sin(time / 600 + i) * 12;

        ctx.strokeStyle = `rgba(160, 240, 255, ${0.6 - i * 0.015})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
        ctx.stroke();
    }

    ctx.strokeStyle = colors.auroraGreen;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius * 0.35, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = colors.white;
    ctx.font = fonts.micro;
    ctx.fillText("N", -4, -baseRadius - 6);
    ctx.fillText("S", -3, baseRadius + 10);
    ctx.fillText("E", baseRadius + 6, 3);
    ctx.fillText("W", -baseRadius - 12, 4);

    ctx.restore();
}

function drawFloatingPanels(ctx, width, height, time, systemData, techParams) {
    const panels = systemData?.guidance ?? [
        {
            heading: "AI CORRIDOR ADVISORY",
            summary: "Flux shear minimal. Optimal window 02:00-03:00.",
            confidence: 0.92,
        },
        {
            heading: "SOLAR WIND",
            summary: "Polar jets stable. Quantum sails engaged.",
            confidence: 0.81,
        },
    ];

    const panelWidth = 220;
    const panelHeight = 120;
    const startY = 80;
    const gap = 20;

    panels.forEach((panel, idx) => {
        const x = idx % 2 === 0 ? 40 : width - panelWidth - 40;
        const y = startY + idx * (panelHeight + gap) + Math.sin(time / 1800 + idx) * 6;

        ctx.fillStyle = colors.panelFill;
        ctx.strokeStyle = colors.panelOutline;
        ctx.lineWidth = 1;
        ctx.beginPath();
        drawRoundedRectPath(ctx, x, y, panelWidth, panelHeight, 10);
        ctx.fill();
        ctx.stroke();

        ctx.font = `bold 12px ${fonts.primary}`;
        ctx.fillStyle = colors.white;
        ctx.fillText(panel.heading, x + 16, y + 24);

        ctx.font = fonts.terminal;
        ctx.fillStyle = colors.icyCyan;
        wrapText(ctx, panel.summary, x + 16, y + 42, panelWidth - 32, 16);

        const confidence = panel.confidence ?? 0;
        const sliderY = y + panelHeight - 32;
        const sliderWidth = panelWidth - 40;

        ctx.strokeStyle = colors.panelOutline;
        ctx.strokeRect(x + 20, sliderY, sliderWidth, 10);

        ctx.fillStyle = colors.auroraGreen;
        ctx.fillRect(x + 20, sliderY, sliderWidth * confidence, 10);

        const knobPosition = sliderWidth * confidence;
        const knobGlow = 3 + Math.sin(time / 200 + confidence * 10) * 1.5;

        ctx.fillStyle = `rgba(255, 255, 255, 0.9)`;
        ctx.beginPath();
        ctx.arc(x + 20 + knobPosition, sliderY + 5, 6 + knobGlow * 0.2, 0, Math.PI * 2);
        ctx.fill();
    });

    const resonance = techParams?.entanglementQuality ?? 0.5;
    const gaugeX = width / 2 - 80;
    const gaugeY = height - 160;
    const gaugeWidth = 160;

    ctx.fillStyle = colors.panelFill;
    ctx.strokeStyle = colors.panelOutline;
    ctx.beginPath();
    drawRoundedRectPath(ctx, gaugeX, gaugeY, gaugeWidth, 90, 12);
    ctx.fill();
    ctx.stroke();

    ctx.font = `bold 12px ${fonts.primary}`;
    ctx.fillStyle = colors.white;
    ctx.fillText("ENTANGLEMENT RESONANCE", gaugeX + 16, gaugeY + 24);

    ctx.strokeStyle = colors.auroraMagenta;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(gaugeX + gaugeWidth / 2, gaugeY + 54, 26, Math.PI, Math.PI * 2);
    ctx.stroke();

    const pointerAngle = Math.PI + Math.PI * resonance;
    ctx.strokeStyle = colors.auroraGreen;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(gaugeX + gaugeWidth / 2, gaugeY + 54);
    ctx.lineTo(
        gaugeX + gaugeWidth / 2 + Math.cos(pointerAngle) * 24,
        gaugeY + 54 + Math.sin(pointerAngle) * 24
    );
    ctx.stroke();
}

function drawTelemetryTicker(ctx, width, height, time, systemData, scanParams, techParams) {
    const tickerHeight = 46;
    const y = height - tickerHeight - 24;

    ctx.fillStyle = "rgba(0, 20, 50, 0.85)";
    ctx.fillRect(40, y, width - 80, tickerHeight);

    ctx.strokeStyle = colors.panelOutline;
    ctx.strokeRect(40, y, width - 80, tickerHeight);

    const baseText = `SCAN ${(scanParams?.scanProgress ?? 0).toFixed(2)} • ` +
        `SNR ${(techParams?.signalNoiseRatio ?? 0).toFixed(2)} • ` +
        `FLUX ${(systemData?.flux ?? 1.0).toFixed(2)} • ` +
        `POLARITY ${systemData?.polarity ?? "STABLE"}`;

    const scrollWidth = ctx.measureText(baseText).width + width;
    const offset = (time / 12) % scrollWidth;

    ctx.save();
    ctx.beginPath();
    ctx.rect(44, y + 6, width - 88, tickerHeight - 12);
    ctx.clip();

    ctx.font = fonts.terminal;
    ctx.fillStyle = colors.icyCyan;
    ctx.fillText(baseText, 44 - offset, y + tickerHeight / 2 + 4);
    ctx.fillText(baseText, 44 - offset + scrollWidth, y + tickerHeight / 2 + 4);

    ctx.restore();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + " ";
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
}

function drawRoundedRectPath(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
}
