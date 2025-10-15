export const colors = {
    background: "#030616",
    deepSpace: "#01030a",
    auroraBase: "rgba(46, 112, 255, 0.65)",
    auroraHighlight: "rgba(213, 93, 255, 0.55)",
    auroraEdge: "rgba(255, 255, 255, 0.35)",
    latticeLine: "rgba(74, 219, 255, 0.3)",
    horizonGrid: "rgba(97, 226, 255, 0.4)",
    horizonGlow: "rgba(255, 255, 255, 0.18)",
    waypointCore: "#8cf7ff",
    waypointRing: "rgba(140, 247, 255, 0.4)",
    ribbonMagenta: "rgba(255, 69, 203, 0.55)",
    ribbonCyan: "rgba(91, 255, 245, 0.55)",
    plaqueBg: "rgba(12, 36, 84, 0.45)",
    plaqueBorder: "rgba(140, 247, 255, 0.6)",
    textPrimary: "#c7f9ff",
    textSecondary: "rgba(199, 249, 255, 0.6)",
    compassPetal: "rgba(140, 247, 255, 0.4)",
    compassGlow: "rgba(255, 255, 255, 0.75)",
    scanline: "rgba(90, 255, 255, 0.08)",
    cornerAccent: "rgba(213, 93, 255, 0.65)",
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
    const timeNow = Date.now();
    const centerX = width / 2;
    const centerY = height * 0.42;

    drawBackground(ctx, width, height, centerY);
    drawStarfield(ctx, width, height, timeNow);
    drawAuroraCones(
        ctx,
        centerX,
        centerY,
        height * 0.55,
        timeNow,
        scanParams?.scanProgress || 0
    );
    drawParallaxFloor(ctx, width, height, timeNow, techParams);
    drawWaypoints(
        ctx,
        centerX,
        centerY,
        height,
        timeNow,
        scanParams,
        systemData
    );
    drawCompassRose(ctx, centerX, centerY, timeNow, techParams);
    drawInfoPlaques(ctx, width, height, timeNow, techParams, systemData);
    drawHeader(ctx, width, timeNow);
    drawCornerTelemetry(ctx, width, height, timeNow, chromaticParams);
    drawScanlines(ctx, width, height, timeNow);
}

function drawBackground(ctx, width, height, centerY) {
    const radial = ctx.createRadialGradient(
        width / 2,
        centerY,
        height * 0.05,
        width / 2,
        centerY,
        height
    );
    radial.addColorStop(0, "rgba(12, 27, 54, 0.9)");
    radial.addColorStop(0.4, "rgba(3, 8, 21, 0.95)");
    radial.addColorStop(1, colors.deepSpace);
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);

    const auroraGlow = ctx.createLinearGradient(0, height * 0.3, 0, height);
    auroraGlow.addColorStop(0, "rgba(95, 173, 255, 0.25)");
    auroraGlow.addColorStop(0.4, "rgba(148, 73, 255, 0.22)");
    auroraGlow.addColorStop(1, "rgba(1, 3, 10, 0)");
    ctx.fillStyle = auroraGlow;
    ctx.fillRect(0, 0, width, height);
}

function drawStarfield(ctx, width, height, time) {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    const seed = 89;
    for (let i = 0; i < 140; i++) {
        const x = ((i * 137) % width) + 0.5;
        const y = ((i * seed) % (height * 0.5)) + 0.5;
        const twinkle = 0.4 + Math.sin(time / 400 + i) * 0.3;
        ctx.globalAlpha = twinkle;
        ctx.fillRect(x, y, 1, 1);
    }

    ctx.globalAlpha = 0.25;
    const cometX = (time / 8) % (width + 200) - 100;
    const cometY = height * 0.18 + Math.sin(time / 1500) * 40;
    const cometGradient = ctx.createRadialGradient(
        cometX,
        cometY,
        0,
        cometX,
        cometY,
        60
    );
    cometGradient.addColorStop(0, "rgba(255, 255, 255, 0.6)");
    cometGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = cometGradient;
    ctx.beginPath();
    ctx.arc(cometX, cometY, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawAuroraCones(ctx, centerX, centerY, radius, time, progress) {
    ctx.save();
    const coneCount = 5;
    for (let i = 0; i < coneCount; i++) {
        const angle = (i / coneCount) * Math.PI * 2 + time / 5000;
        const sway = Math.sin(time / 2000 + i) * 0.3;
        const innerRadius = radius * (0.35 + i * 0.08);
        const outerRadius = innerRadius * (1.45 + Math.sin(time / 800 + i) * 0.05);
        const startAngle = angle - 0.35 - sway * 0.15;
        const endAngle = angle + 0.35 + sway * 0.15;

        const gradient = ctx.createRadialGradient(
            centerX,
            centerY,
            innerRadius * 0.3,
            centerX,
            centerY,
            outerRadius
        );
        gradient.addColorStop(0, colors.auroraHighlight);
        gradient.addColorStop(0.6, colors.auroraBase);
        gradient.addColorStop(1, "rgba(20, 10, 45, 0)");

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle, false);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.75 + 0.25 * Math.sin(time / 1500 + i * 2 + progress * Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = colors.auroraEdge;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle, false);
        ctx.stroke();
    }

    ctx.restore();
}

function drawParallaxFloor(ctx, width, height, time, techParams) {
    ctx.save();
    const horizonY = height * 0.68;
    const gridDepth = height * 0.35;
    const speed = (techParams?.energyLevel || 40) / 40;
    const scroll = (time / 12) * speed;

    ctx.globalAlpha = 0.75;
    ctx.fillStyle = colors.horizonGlow;
    ctx.fillRect(0, horizonY - 10, width, 60);

    ctx.strokeStyle = colors.horizonGrid;
    ctx.lineWidth = 1;

    for (let i = 0; i < 40; i++) {
        const z = (i / 40) * gridDepth;
        const y = horizonY + z;
        const alpha = 1 - i / 40;
        ctx.globalAlpha = alpha * 0.35;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    const vanishingPointX = width / 2 + Math.sin(time / 3000) * 80;
    for (let i = -12; i <= 12; i++) {
        const offset = i * 60;
        const dynamic = ((scroll + offset) % (width * 2)) - width;
        const x = vanishingPointX + dynamic * 0.2;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.moveTo(vanishingPointX, horizonY);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    ctx.restore();
}

function drawWaypoints(ctx, centerX, centerY, height, time, scanParams, systemData) {
    const routes = systemData?.routes || [
        { name: "POLARIS REACH", distance: 2.6, confidence: 0.92 },
        { name: "AURORA VEIL", distance: 3.9, confidence: 0.84 },
        { name: "ION TRAIL", distance: 5.1, confidence: 0.77 },
    ];

    ctx.save();
    const baseRadius = height * 0.18;
    routes.forEach((route, index) => {
        const orbitRadius = baseRadius + index * 60;
        const angle = time / 3000 + index * 0.8;
        const x = centerX + Math.cos(angle) * orbitRadius;
        const y = centerY + Math.sin(angle) * orbitRadius * 0.55;

        ctx.globalAlpha = 0.6 + 0.4 * Math.sin(time / 900 + index);
        ctx.fillStyle = colors.waypointRing;
        ctx.beginPath();
        ctx.arc(x, y, 32, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.fillStyle = colors.waypointCore;
        ctx.beginPath();
        ctx.arc(x, y, 10 + (scanParams?.scanProgress || 0) * 6, 0, Math.PI * 2);
        ctx.fill();

        drawEntanglementRibbon(ctx, x, y, orbitRadius, angle, index, time);
        drawWaypointLabel(ctx, x, y, route, index, time);
    });
    ctx.restore();
}

function drawEntanglementRibbon(ctx, x, y, radius, angle, index, time) {
    ctx.save();
    const points = 14;
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
        const t = i / points;
        const wave = Math.sin(time / 500 + t * Math.PI * 6 + index);
        const px = x + Math.cos(angle + t * 1.6) * radius * 0.18 * (1 - t);
        const py = y + Math.sin(angle + t * 1.6) * radius * 0.18 * (1 - t) + wave * 12;
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    const gradient = ctx.createLinearGradient(x - 50, y - 50, x + 50, y + 50);
    gradient.addColorStop(0, colors.ribbonMagenta);
    gradient.addColorStop(1, colors.ribbonCyan);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2.4;
    ctx.globalAlpha = 0.8;
    ctx.stroke();
    ctx.restore();
}

function drawWaypointLabel(ctx, x, y, route, index, time) {
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = colors.textPrimary;
    ctx.font = `11px ${fonts.header}`;
    const labelX = x + 42;
    const labelY = y - 22;
    ctx.fillText(route.name, labelX, labelY);

    ctx.fillStyle = colors.textSecondary;
    ctx.font = `9px ${fonts.terminal}`;
    ctx.fillText(`Δ ${route.distance.toFixed(1)} LS`, labelX, labelY + 14);
    ctx.fillText(
        `CONF ${(route.confidence * 100).toFixed(0)}%`,
        labelX,
        labelY + 26
    );

    const pulse = 6 + Math.sin(time / 400 + index) * 4;
    ctx.strokeStyle = colors.waypointRing;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, 20 + pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

function drawCompassRose(ctx, centerX, centerY, time, techParams) {
    ctx.save();
    const orientation = techParams?.orientation || 0;
    ctx.translate(centerX, centerY + 10);
    ctx.rotate((orientation * Math.PI) / 180);

    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const length = 70 + (i % 2 === 0 ? 24 : 0);
        ctx.globalAlpha = 0.5 + (i % 2 === 0 ? 0.3 : 0);
        ctx.strokeStyle = colors.compassPetal;
        ctx.lineWidth = i % 2 === 0 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length * 0.7);
        ctx.stroke();
    }

    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = colors.compassGlow;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = colors.textPrimary;
    ctx.font = `10px ${fonts.header}`;
    ctx.textAlign = "center";
    ctx.fillText("N", 0, -48);
    ctx.fillText("S", 0, 62);
    ctx.fillText("E", 52, 6);
    ctx.fillText("W", -52, 6);

    const needleAngle = (time / 2000) % (Math.PI * 2);
    ctx.rotate(needleAngle);
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = colors.ribbonCyan;
    ctx.beginPath();
    ctx.moveTo(0, -40);
    ctx.lineTo(0, 40);
    ctx.stroke();

    ctx.restore();
}

function drawInfoPlaques(ctx, width, height, time, techParams, systemData) {
    const plaques = systemData?.aiGuidance || [
        { label: "OPTIMIZE DRIFT", value: "+12%", suggestion: "Adjust polar angle" },
        { label: "SOLAR WIND", value: "STABLE", suggestion: "Hold course" },
        { label: "ION WAKE", value: "ELEVATED", suggestion: "Deploy filters" },
    ];

    ctx.save();
    const plaqueWidth = 220;
    const plaqueHeight = 86;
    plaques.forEach((plaque, index) => {
        const x = index % 2 === 0 ? 40 : width - plaqueWidth - 40;
        const y = 110 + index * (plaqueHeight + 20);
        const oscillation = Math.sin(time / 1400 + index) * 6;

        ctx.globalAlpha = 0.65;
        ctx.fillStyle = colors.plaqueBg;
        ctx.fillRect(x, y + oscillation, plaqueWidth, plaqueHeight);

        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = colors.plaqueBorder;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y + oscillation, plaqueWidth, plaqueHeight);

        ctx.fillStyle = colors.textSecondary;
        ctx.font = `9px ${fonts.terminal}`;
        ctx.fillText(plaque.label, x + 14, y + oscillation + 22);

        ctx.fillStyle = colors.textPrimary;
        ctx.font = `18px ${fonts.header}`;
        ctx.fillText(plaque.value, x + 14, y + oscillation + 44);

        ctx.fillStyle = colors.textSecondary;
        ctx.font = `9px ${fonts.terminal}`;
        ctx.fillText(plaque.suggestion, x + 14, y + oscillation + 62);

        const confidence = plaque.confidence ?? techParams?.stability ?? 0.7;
        drawConfidenceBar(ctx, x + 14, y + oscillation + 68, plaqueWidth - 28, confidence, time);
    });
    ctx.restore();
}

function drawConfidenceBar(ctx, x, y, width, value, time) {
    const clamped = Math.max(0, Math.min(1, value));
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = colors.latticeLine;
    ctx.fillRect(x, y, width, 6);

    ctx.globalAlpha = 0.8;
    const gradient = ctx.createLinearGradient(x, y, x + width, y);
    gradient.addColorStop(0, colors.ribbonCyan);
    gradient.addColorStop(1, colors.ribbonMagenta);
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width * clamped, 6);

    ctx.globalAlpha = 0.6;
    ctx.fillStyle = colors.textSecondary;
    ctx.font = `8px ${fonts.terminal}`;
    ctx.fillText(`${Math.round(clamped * 100)}%`, x + width - 30, y + 5);

    const pulseX = x + (width * ((time / 1600) % 1));
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = colors.auroraEdge;
    ctx.fillRect(pulseX, y - 2, 2, 10);
    ctx.restore();
}

function drawHeader(ctx, width, time) {
    ctx.save();
    ctx.fillStyle = colors.plaqueBg;
    ctx.globalAlpha = 0.75;
    ctx.fillRect(30, 24, width - 60, 52);

    ctx.strokeStyle = colors.plaqueBorder;
    ctx.lineWidth = 1.8;
    ctx.globalAlpha = 0.95;
    ctx.strokeRect(30, 24, width - 60, 52);

    ctx.font = `24px ${fonts.header}`;
    ctx.fillStyle = colors.textPrimary;
    ctx.textAlign = "center";
    ctx.fillText("AURORA MESH NAVIGATOR", width / 2, 52);

    ctx.font = `11px ${fonts.terminal}`;
    ctx.fillStyle = colors.textSecondary;
    const status = Math.sin(time / 2200) > 0 ? "ENTANGLE" : "DECORRELATE";
    ctx.fillText(`POLAR TRADE ROUTE • MODE: ${status}`, width / 2, 68);
    ctx.restore();
}

function drawCornerTelemetry(ctx, width, height, time, chromaticParams) {
    ctx.save();
    ctx.strokeStyle = colors.cornerAccent;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.8;

    const corners = [
        { x: 24, y: 24 },
        { x: width - 24, y: 24 },
        { x: 24, y: height - 24 },
        { x: width - 24, y: height - 24 },
    ];

    corners.forEach(({ x, y }) => {
        ctx.beginPath();
        ctx.moveTo(x, y + (y < height / 2 ? 18 : -18));
        ctx.lineTo(x + (x < width / 2 ? 18 : -18), y);
        ctx.stroke();
    });

    ctx.font = `9px ${fonts.terminal}`;
    ctx.fillStyle = colors.textSecondary;
    ctx.textAlign = "left";
    ctx.globalAlpha = 0.9;
    ctx.fillText(
        `CHROMA ${((chromaticParams?.offset || 0) * 100).toFixed(1)}%`,
        34,
        height - 46
    );
    ctx.fillText(
        `REFRACTION ${(Math.sin(time / 1800) * 12 + 48).toFixed(1)}°`,
        34,
        height - 30
    );
    ctx.restore();
}

function drawScanlines(ctx, width, height, time) {
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = colors.scanline;
    const offset = (time / 35) % 4;
    for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y + offset, width, 2);
    }
    ctx.restore();
}
