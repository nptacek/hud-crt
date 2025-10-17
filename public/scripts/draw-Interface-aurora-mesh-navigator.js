export const colors = {
    background: "#01030f",
    deepSpace: "#02061b",
    polarBlue: "#24d3ff",
    auroraMagenta: "#ff5fd6",
    auroraViolet: "#845bff",
    auroraWhite: "#f4faff",
    gridLine: "rgba(68, 164, 255, 0.18)",
    faintGrid: "rgba(24, 112, 198, 0.08)",
    accentLime: "#77ffb3",
    accentAmber: "#ffc775",
    panelBg: "rgba(8, 34, 74, 0.28)",
    panelBorder: "rgba(103, 208, 255, 0.6)",
    textPrimary: "#e8f9ff",
    textSecondary: "rgba(200, 240, 255, 0.85)",
    ribbon: "rgba(255, 131, 209, 0.65)",
    ribbonSecondary: "rgba(86, 225, 255, 0.55)",
    indicator: "rgba(116, 255, 206, 0.95)",
    warning: "#ff5f6d",
};

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
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const timeNow = Date.now();

    drawBackground(ctx, width, height, centerX, centerY, timeNow);
    drawParallaxGrid(ctx, width, height, timeNow, chromaticParams);

    ctx.save();
    ctx.strokeStyle = colors.panelBorder;
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, width - 24, height - 24);
    ctx.restore();

    drawHeader(ctx, width, timeNow, systemData);
    drawAuroraCones(ctx, centerX, centerY, width, height, scanParams, timeNow);
    drawWaypoints(ctx, centerX, centerY, width, height, scanParams, systemData, timeNow);
    drawCompassPetals(ctx, centerX, centerY, scanParams, timeNow);
    drawFloatingPlaques(ctx, width, height, timeNow, techParams, systemData);
    drawRibbonStreams(ctx, centerX, centerY, scanParams, timeNow);
    drawTelemetryTicker(ctx, width, height, timeNow, techParams);
    drawCornerDiagnostics(ctx, width, height, timeNow, techParams, systemData);
}

function drawBackground(ctx, width, height, centerX, centerY, timeNow) {
    const gradient = ctx.createRadialGradient(centerX, centerY * 0.7, 0, centerX, centerY, width * 0.95);
    gradient.addColorStop(0, "#061737");
    gradient.addColorStop(0.4, colors.deepSpace);
    gradient.addColorStop(1, colors.background);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.12 + 0.05 * Math.sin(timeNow / 1200);
    ctx.fillStyle = colors.auroraMagenta;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY * 0.3, width * 0.4, height * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawParallaxGrid(ctx, width, height, timeNow, chromaticParams) {
    const perspectiveDepth = 420;
    const gridLines = 26;
    const offset = (timeNow / 35) % 100;
    ctx.save();
    ctx.strokeStyle = colors.faintGrid;
    ctx.lineWidth = 1;
    ctx.translate(0, height * 0.58);

    for (let i = 0; i < gridLines; i++) {
        const z = i * 14 + offset;
        const scale = perspectiveDepth / (perspectiveDepth + z);
        const opacity = Math.max(0, 0.2 - i * 0.006);
        ctx.globalAlpha = opacity + chromaticParams.chromaticAberration * 0.05;
        const halfWidth = (width * 1.4) * scale;

        ctx.beginPath();
        ctx.moveTo(centeredX(width, 0) - halfWidth, z * 0.28);
        ctx.lineTo(centeredX(width, 0) + halfWidth, z * 0.28);
        ctx.stroke();
    }

    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = colors.gridLine;
    for (let i = -14; i <= 14; i++) {
        ctx.beginPath();
        ctx.moveTo(centeredX(width, 0) + i * 42, -20);
        ctx.lineTo(centeredX(width, 0) + i * 14, height * 0.42);
        ctx.stroke();
    }

    ctx.restore();
}

function centeredX(width, offset) {
    return width / 2 + offset;
}

function drawHeader(ctx, width, timeNow, systemData) {
    const headerHeight = 60;
    ctx.save();
    ctx.fillStyle = colors.panelBg;
    ctx.fillRect(28, 24, width - 56, headerHeight);

    ctx.strokeStyle = colors.panelBorder;
    ctx.lineWidth = 1.4;
    ctx.strokeRect(28, 24, width - 56, headerHeight);

    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.font = `600 16px ${fonts.primary}`;
    ctx.fillStyle = colors.textPrimary;
    ctx.fillText("AURORA MESH NAVIGATOR", 48, 24 + headerHeight / 2);

    ctx.textAlign = "right";
    ctx.font = `600 13px ${fonts.terminal}`;
    const scanReadout = `SCAN ${Math.round((systemData.entanglementIndex || 0) * 100)}% • VAR ${Math.round((systemData.routeVariance || 0) * 100)}%`;
    ctx.fillText(scanReadout, width - 64, 24 + headerHeight / 2);

    ctx.globalAlpha = 0.55 + 0.35 * Math.sin(timeNow / 400);
    ctx.strokeStyle = colors.auroraMagenta;
    ctx.beginPath();
    ctx.moveTo(48, 24 + headerHeight - 12);
    ctx.lineTo(width - 48, 24 + headerHeight - 12);
    ctx.stroke();
    ctx.restore();
}

function drawAuroraCones(ctx, centerX, centerY, width, height, scanParams, timeNow) {
    const sweepProgress = (scanParams.scanProgress || 0) % 1;
    const maxRadius = Math.min(width, height) * 0.36;
    const layerCount = 6;

    ctx.save();
    ctx.translate(centerX, centerY * 0.9);

    for (let i = 0; i < layerCount; i++) {
        const layerRatio = i / layerCount;
        const oscillation = Math.sin(timeNow / (600 + i * 90) + layerRatio * Math.PI * 1.5);
        const radius = maxRadius * (0.35 + layerRatio * 0.7 + oscillation * 0.05);
        const angleOffset = sweepProgress * Math.PI * 2 + i * 0.35;
        const arcWidth = Math.PI * (0.45 + layerRatio * 0.3);

        const gradient = ctx.createRadialGradient(0, -radius * 0.8, radius * 0.1, 0, 0, radius);
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.2)");
        gradient.addColorStop(0.5, colors.auroraMagenta + "33");
        gradient.addColorStop(1, colors.auroraViolet + "12");

        ctx.globalAlpha = 0.35 - layerRatio * 0.04;
        ctx.fillStyle = gradient;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.ellipse(
            0,
            -radius * 0.65,
            radius * 0.6,
            radius,
            angleOffset,
            -arcWidth / 2,
            arcWidth / 2
        );
        ctx.closePath();
        ctx.fill();

        ctx.globalAlpha = 0.45;
        ctx.strokeStyle = colors.auroraWhite;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, -radius * 0.65, radius * 0.58, angleOffset - arcWidth / 2, angleOffset + arcWidth / 2);
        ctx.stroke();
    }

    ctx.restore();
}

function drawWaypoints(ctx, centerX, centerY, width, height, scanParams, systemData, timeNow) {
    const waypointCount = 6;
    const baseRadius = Math.min(width, height) * 0.3;
    const pulse = 0.5 + 0.5 * Math.sin(timeNow / 800);

    ctx.save();
    ctx.translate(centerX, centerY * 0.75);

    for (let i = 0; i < waypointCount; i++) {
        const angle = (Math.PI * 2 * i) / waypointCount + timeNow / (4200 - i * 200);
        const radius = baseRadius * (0.6 + 0.08 * Math.sin(timeNow / (1000 + i * 250)));
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.65;

        ctx.globalAlpha = 0.45;
        ctx.strokeStyle = colors.panelBorder;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, 36, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = 0.18 + pulse * 0.2;
        ctx.fillStyle = colors.ribbonSecondary;
        ctx.beginPath();
        ctx.arc(x, y, 28, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.85;
        ctx.fillStyle = colors.textPrimary;
        ctx.font = `600 12px ${fonts.primary}`;
        const label = systemData.routes && systemData.routes[i] ? systemData.routes[i].designation : `NEX-${i + 1}`;
        ctx.textAlign = "center";
        ctx.fillText(label, x, y + 4);

        const entanglement = systemData.routes && systemData.routes[i] ? systemData.routes[i].entanglement : 0.5;
        const progress = ((scanParams.scanProgress || 0) * 100 + i * 7) % 100;
        drawWaypointGauges(ctx, x, y, entanglement, progress / 100, timeNow, i);
    }

    ctx.restore();
}

function drawWaypointGauges(ctx, x, y, entanglement, progress, timeNow, index) {
    const radius = 44;
    ctx.save();
    ctx.translate(x, y);

    ctx.globalAlpha = 0.65;
    ctx.strokeStyle = colors.accentLime;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, 0, radius, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = colors.auroraMagenta;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, radius + 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.globalAlpha = 0.8;
    ctx.fillStyle = colors.textSecondary;
    ctx.font = `500 10px ${fonts.primary}`;
    ctx.textAlign = "center";
    ctx.fillText(`ETA ${(entanglement * 120).toFixed(0)}m`, 0, radius + 16);

    ctx.globalAlpha = 0.7 + 0.3 * Math.sin(timeNow / (900 + index * 120));
    ctx.fillStyle = colors.indicator;
    ctx.beginPath();
    ctx.arc(0, -radius + 6, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawCompassPetals(ctx, centerX, centerY, scanParams, timeNow) {
    const heading = scanParams.heading || 0;
    const petals = 16;
    const radius = Math.min(centerX, centerY) * 0.6;

    ctx.save();
    ctx.translate(centerX, centerY * 0.94);
    ctx.rotate(heading + Math.sin(timeNow / 2600) * 0.03);

    for (let i = 0; i < petals; i++) {
        const angle = (Math.PI * 2 * i) / petals;
        const length = radius * (0.4 + 0.1 * Math.sin(timeNow / 800 + i));
        ctx.globalAlpha = 0.12 + 0.08 * Math.sin(timeNow / 500 + i * 0.9);
        ctx.strokeStyle = colors.panelBorder;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
        ctx.stroke();
    }

    ctx.globalAlpha = 0.65;
    ctx.strokeStyle = colors.auroraWhite;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.42, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = colors.textPrimary;
    ctx.font = `600 14px ${fonts.header}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${Math.round(((heading % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) * (180 / Math.PI))}°`, 0, 0);
    ctx.restore();
}

function drawFloatingPlaques(ctx, width, height, timeNow, techParams, systemData) {
    const plaqueWidth = 220;
    const plaqueHeight = 130;
    const gap = 24;

    ctx.save();
    ctx.globalAlpha = 0.95;

    const leftData = systemData.routes || [];
    for (let i = 0; i < 3; i++) {
        const x = 36;
        const y = 120 + i * (plaqueHeight + gap);
        drawPlaque(ctx, x, y, plaqueWidth, plaqueHeight, leftData[i], timeNow, techParams, i);
    }

    for (let i = 0; i < 3; i++) {
        const x = width - plaqueWidth - 36;
        const y = 120 + i * (plaqueHeight + gap);
        drawPlaque(ctx, x, y, plaqueWidth, plaqueHeight, leftData[i + 3], timeNow, techParams, i + 3, true);
    }

    ctx.restore();
}

function drawPlaque(ctx, x, y, w, h, routeData, timeNow, techParams, index, flip) {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = colors.panelBg;
    ctx.strokeStyle = colors.panelBorder;
    ctx.lineWidth = 1.2;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeRect(0, 0, w, h);

    ctx.font = `600 12px ${fonts.primary}`;
    ctx.fillStyle = colors.textPrimary;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(routeData ? routeData.designation : `THREAD-${index + 1}`, 12, 12);

    ctx.font = `500 10px ${fonts.primary}`;
    ctx.fillStyle = colors.textSecondary;
    ctx.fillText(`CONF ${(routeData ? routeData.confidence : 0.62).toFixed(2)} • WARP ${(techParams.warpCharge || 0.52).toFixed(2)}`, 12, 32);

    const suggestion = routeData ? routeData.suggestion : "Recalibrate polar vectors";
    wrapText(ctx, suggestion, 12, 52, w - 24, 14);

    const sliderProgress = 0.5 + 0.4 * Math.sin(timeNow / (900 + index * 80));
    ctx.strokeStyle = colors.auroraMagenta;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(12, h - 32);
    ctx.lineTo(w - 12, h - 32);
    ctx.stroke();

    ctx.strokeStyle = colors.accentLime;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(12, h - 32);
    ctx.lineTo(12 + (w - 24) * sliderProgress, h - 32);
    ctx.stroke();

    ctx.fillStyle = colors.accentAmber;
    ctx.beginPath();
    const handleX = 12 + (w - 24) * sliderProgress;
    ctx.arc(handleX, h - 32, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = colors.textSecondary;
    ctx.font = `600 10px ${fonts.primary}`;
    ctx.textAlign = flip ? "left" : "right";
    ctx.fillText(flip ? "AUTO-FLOW" : "MANUAL", flip ? 12 : w - 12, h - 16);

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

function drawRibbonStreams(ctx, centerX, centerY, scanParams, timeNow) {
    const ribbons = 4;
    const baseRadius = Math.min(centerX, centerY) * 0.62;
    ctx.save();
    ctx.translate(centerX, centerY * 0.85);

    for (let i = 0; i < ribbons; i++) {
        const angle = (Math.PI * 2 * i) / ribbons + (scanParams.scanProgress || 0) * Math.PI * 2;
        const sway = Math.sin(timeNow / (700 + i * 120)) * 0.6;
        const ribbonLength = baseRadius * (0.6 + 0.2 * Math.sin(timeNow / 900 + i));

        ctx.strokeStyle = i % 2 === 0 ? colors.ribbon : colors.ribbonSecondary;
        ctx.lineWidth = 2.4;
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        for (let t = 0; t <= 1; t += 0.1) {
            const radius = ribbonLength * t;
            const theta = angle + sway * t * 0.4;
            const x = Math.cos(theta) * radius;
            const y = Math.sin(theta) * radius * 0.7;
            if (t === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }

    ctx.restore();
}

function drawTelemetryTicker(ctx, width, height, timeNow, techParams) {
    const tickerHeight = 44;
    const y = height - tickerHeight - 28;

    ctx.save();
    ctx.fillStyle = colors.panelBg;
    ctx.fillRect(120, y, width - 240, tickerHeight);
    ctx.strokeStyle = colors.panelBorder;
    ctx.lineWidth = 1.4;
    ctx.strokeRect(120, y, width - 240, tickerHeight);

    ctx.beginPath();
    ctx.moveTo(120, y + tickerHeight / 2);
    ctx.lineTo(width - 120, y + tickerHeight / 2);
    ctx.strokeStyle = "rgba(36, 211, 255, 0.18)";
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.font = `600 12px ${fonts.primary}`;
    ctx.fillStyle = colors.textSecondary;
    ctx.textAlign = "left";
    const tickerText = `AI OPTIMALITY ${(techParams.aiOptimality || 0.78).toFixed(2)} • ROUTE COHERENCE ${(techParams.routeCoherence || 0.64).toFixed(2)} • FIELD STABILITY ${(techParams.fieldStability || 0.88).toFixed(2)}`;
    const scrollOffset = ((timeNow / 20) % (ctx.measureText(tickerText).width + 200));
    ctx.save();
    ctx.beginPath();
    ctx.rect(130, y + 8, width - 260, tickerHeight - 16);
    ctx.clip();
    ctx.fillText(tickerText, 130 - scrollOffset, y + tickerHeight / 2 + 4);
    ctx.fillText(tickerText, 130 - scrollOffset + ctx.measureText(tickerText).width + 160, y + tickerHeight / 2 + 4);
    ctx.restore();
    ctx.restore();
}

function drawCornerDiagnostics(ctx, width, height, timeNow, techParams, systemData) {
    ctx.save();
    ctx.font = `600 11px ${fonts.primary}`;
    ctx.fillStyle = colors.textSecondary;
    ctx.textAlign = "left";

    const leftInfo = [
        `NAV-MOD ${(techParams.navigatorMode || 3).toString().padStart(2, "0")}`,
        `DRIFT ${(systemData.magneticDrift || 0.12).toFixed(3)}`,
        `SOLAR ${(systemData.solarFlux || 1.02).toFixed(2)}`,
    ];
    leftInfo.forEach((text, index) => {
        ctx.globalAlpha = 0.6 + 0.2 * Math.sin(timeNow / (600 + index * 150));
        ctx.fillText(text, 32, height - 84 + index * 18);
    });

    ctx.textAlign = "right";
    const rightInfo = [
        `WARP ${(techParams.warpCharge || 0.58).toFixed(2)}`,
        `ION ${(systemData.ionStream || 0.42).toFixed(2)}`,
        `TRACE ${(systemData.traceLock || 0.91).toFixed(2)}`,
    ];
    rightInfo.forEach((text, index) => {
        ctx.globalAlpha = 0.55 + 0.3 * Math.sin(timeNow / (680 + index * 120));
        ctx.fillText(text, width - 32, height - 84 + index * 18);
    });

    ctx.restore();
}
