export const colors = {
    background: "#020516",
    horizon: "#04142c",
    auroraBlue: "#33ddff",
    auroraMagenta: "#ff55ff",
    auroraWhite: "rgba(220, 255, 255, 0.9)",
    waypoint: "#ffe066",
    ribbon: "rgba(132, 255, 211, 0.8)",
    panelBg: "rgba(8, 30, 60, 0.65)",
    panelBorder: "rgba(140, 220, 255, 0.8)",
    compassText: "#9cf3ff",
    gridNear: "rgba(60, 200, 255, 0.55)",
    gridFar: "rgba(40, 120, 200, 0.1)",
    traceLine: "rgba(255, 220, 120, 0.7)",
    indicator: "#66ffda",
    text: "#dff7ff",
    shadow: "rgba(0, 10, 20, 0.6)",
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
    scanParams = scanParams || {};
    techParams = techParams || {};
    systemData = systemData || {};
    const timeNow = Date.now();
    const centerX = width / 2;
    const centerY = height * 0.55;

    drawBackground(ctx, width, height, timeNow);
    drawParallaxFloor(ctx, width, height, timeNow, techParams);
    drawAuroraCones(ctx, centerX, centerY, height, timeNow, scanParams);
    drawEntanglementRibbons(ctx, centerX, centerY, timeNow, systemData);
    drawWaypoints(ctx, centerX, centerY, timeNow, systemData, scanParams);
    drawCompass(ctx, width, height, timeNow, techParams);
    drawInfoPlaques(ctx, width, height, timeNow, systemData, techParams, scanParams);
    drawStatusTicker(ctx, width, height, timeNow, systemData);
}

function drawBackground(ctx, width, height, time) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#040916");
    gradient.addColorStop(0.45, colors.background);
    gradient.addColorStop(1, colors.horizon);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // star field
    ctx.save();
    ctx.globalAlpha = 0.55;
    for (let i = 0; i < 140; i++) {
        const x = ((i * 73.7) % width) + Math.sin((time / 6000 + i) * 0.5) * 15;
        const y = (i * 53.3) % (height * 0.6);
        const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(time / 900 + i));
        ctx.fillStyle = `rgba(180, 235, 255, ${twinkle})`;
        ctx.fillRect(x, y, (i % 2) + 1, (i % 2) + 1);
    }
    ctx.restore();
}

function drawParallaxFloor(ctx, width, height, time, techParams) {
    const horizonY = height * 0.62;
    const gridDepth = height - horizonY;
    const speed = (techParams.energyLevel || 32) * 0.6;
    const scroll = (time / 35) * (speed / 18);

    ctx.save();
    ctx.translate(width / 2, horizonY);
    const lines = 28;
    for (let i = 1; i <= lines; i++) {
        const depth = i / lines;
        const y = depth * gridDepth;
        const fade = Math.pow(1 - depth, 1.6);
        ctx.strokeStyle = `rgba(70, 200, 255, ${fade})`;
        ctx.lineWidth = 1.2 * (1 - depth) + 0.3;
        ctx.beginPath();
        ctx.moveTo(-width, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    const verticalLines = 36;
    for (let i = -verticalLines; i <= verticalLines; i++) {
        const offset = ((i + 1000) * 60 + scroll) % (verticalLines * 60);
        const x = (offset - (verticalLines * 60) / 2) * 0.7;
        ctx.strokeStyle = x === 0 ? colors.gridNear : colors.gridFar;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x * 0.25, gridDepth);
        ctx.stroke();
    }
    ctx.restore();

    const haze = ctx.createLinearGradient(0, horizonY - 60, 0, height);
    haze.addColorStop(0, "rgba(20, 80, 120, 0.4)");
    haze.addColorStop(1, "rgba(2, 5, 22, 0)");
    ctx.fillStyle = haze;
    ctx.fillRect(0, horizonY - 60, width, gridDepth + 60);
}

function drawAuroraCones(ctx, centerX, centerY, height, time, scanParams) {
    const scanProgress = (scanParams.scanProgress || 0) % 1;
    const pulse = 0.5 + 0.5 * Math.sin(time / 600);
    const coneCount = 4;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < coneCount; i++) {
        const angle = ((time / 3000) + i / coneCount) * Math.PI * 2;
        const radius = height * (0.3 + 0.15 * Math.sin(time / 2000 + i));
        const sweep = Math.PI / 6 + Math.sin(time / 4000 + i) * 0.15;
        const startAngle = angle - sweep;
        const endAngle = angle + sweep;

        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, `rgba(50, 180, 255, ${0.35 + pulse * 0.35})`);
        gradient.addColorStop(scanProgress * 0.6 + 0.15, `rgba(255, 120, 255, ${0.2 + pulse * 0.25})`);
        gradient.addColorStop(1, "rgba(10, 20, 60, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - height * 0.2);
        ctx.arc(centerX, centerY - height * 0.2, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 + pulse * 0.1})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY - height * 0.2, radius * (0.7 + scanProgress * 0.3), startAngle, endAngle);
        ctx.stroke();
    }
    ctx.restore();

    // central anchor
    ctx.save();
    ctx.shadowColor = colors.auroraWhite;
    ctx.shadowBlur = 30;
    ctx.fillStyle = colors.auroraWhite;
    ctx.beginPath();
    ctx.arc(centerX, centerY - height * 0.2, 6 + pulse * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawEntanglementRibbons(ctx, centerX, centerY, time, systemData) {
    const ribbons = (systemData?.routes || []).slice(0, 6);
    const baseRadius = 120;

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ribbons.forEach((route, index) => {
        const progress = ((time / 1400) + index * 0.2) % 1;
        const wobble = Math.sin(time / 600 + index);
        const radius = baseRadius + index * 26 + wobble * 10;
        const arc = Math.PI * (0.6 + Math.sin(time / 2200 + index) * 0.2);
        const offset = progress * Math.PI * 2;

        ctx.strokeStyle = `rgba(140, 255, 210, ${0.45 + Math.sin(time / 500 + index) * 0.2})`;
        ctx.lineWidth = 3 + Math.sin(time / 800 + index) * 1.2;
        ctx.beginPath();
        ctx.arc(centerX, centerY - 90, radius, offset, offset + arc);
        ctx.stroke();

        if (route) {
            const textAngle = offset + arc / 2;
            const x = centerX + Math.cos(textAngle) * (radius + 18);
            const y = centerY - 90 + Math.sin(textAngle) * (radius + 18);
            ctx.save();
            ctx.fillStyle = colors.text;
            ctx.font = "12px " + fonts.primary;
            ctx.textAlign = "center";
            ctx.fillText(route.name || `Route-${index + 1}`, x, y);
            ctx.restore();
        }
    });
    ctx.restore();
}

function drawWaypoints(ctx, centerX, centerY, time, systemData, scanParams) {
    const routes = systemData?.routes || [];
    const orbitRadius = 160;
    ctx.save();
    routes.slice(0, 8).forEach((route, idx) => {
        const angle = (time / 2500 + idx / routes.length) * Math.PI * 2;
        const radius = orbitRadius + Math.sin(time / 900 + idx) * 12;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY - 110 + Math.sin(angle) * radius * 0.55;

        ctx.shadowColor = colors.waypoint;
        ctx.shadowBlur = 12;
        ctx.fillStyle = colors.waypoint;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = colors.traceLine;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 90);
        ctx.lineTo(x, y);
        ctx.stroke();

        ctx.fillStyle = colors.text;
        ctx.font = "11px " + fonts.primary;
        ctx.textAlign = "center";
        ctx.fillText(route?.eta ? `ETA ${route.eta}` : "ETA TBC", x, y - 12);
    });

    const progressRadius = orbitRadius * (0.75 + (scanParams?.scanProgress || 0) * 0.35);
    ctx.strokeStyle = colors.indicator;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(centerX, centerY - 90, progressRadius, -Math.PI / 2, -Math.PI / 2 + (scanParams?.scanProgress || 0) * Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
}

function drawCompass(ctx, width, height, time, techParams) {
    const radius = 60;
    const x = width - 110;
    const y = 120;
    const orientation = (techParams?.orientation || 0) + Math.sin(time / 2000) * 0.2;

    ctx.save();
    ctx.translate(x, y);

    ctx.strokeStyle = colors.panelBorder;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const inner = radius - 6;
        const outer = radius;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
        ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
        ctx.stroke();
    }

    ctx.rotate(orientation);
    ctx.fillStyle = colors.auroraMagenta;
    ctx.beginPath();
    ctx.moveTo(0, -radius + 10);
    ctx.lineTo(-6, 6);
    ctx.lineTo(6, 6);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    ctx.save();
    ctx.fillStyle = colors.compassText;
    ctx.font = "12px " + fonts.header;
    ctx.textAlign = "center";
    ctx.fillText("AURORA VECTOR", x, y + radius + 16);
    ctx.fillText(`${(orientation * (180 / Math.PI)).toFixed(1)}°`, x, y + radius + 30);
    ctx.restore();
}

function drawInfoPlaques(ctx, width, height, time, systemData, techParams, scanParams) {
    const plaqueWidth = 220;
    const plaqueHeight = 140;

    const leftX = 30;
    const rightX = width - plaqueWidth - 30;
    const baseY = height * 0.18;

    const plaques = [
        {
            x: leftX,
            y: baseY,
            title: "AI VECTOR SYNTH",
            lines: buildRouteSummaries(systemData?.routes, scanParams),
        },
        {
            x: rightX,
            y: baseY,
            title: "FLUX BALANCE",
            lines: buildFluxSummaries(techParams),
        },
    ];

    plaques.forEach((plaque, index) => {
        const shimmer = 0.25 + 0.15 * Math.sin(time / 900 + index);
        ctx.fillStyle = `rgba(8, 30, 60, ${0.55 + shimmer})`;
        ctx.fillRect(plaque.x, plaque.y, plaqueWidth, plaqueHeight);

        ctx.strokeStyle = colors.panelBorder;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(plaque.x, plaque.y, plaqueWidth, plaqueHeight);

        ctx.fillStyle = colors.text;
        ctx.font = "14px " + fonts.header;
        ctx.fillText(plaque.title, plaque.x + 18, plaque.y + 24);

        ctx.font = "12px " + fonts.primary;
        plaque.lines.forEach((line, lineIndex) => {
            ctx.fillStyle = `rgba(220, 255, 255, ${0.8 - lineIndex * 0.1})`;
            ctx.fillText(line, plaque.x + 18, plaque.y + 44 + lineIndex * 18);
        });
    });
}

function buildRouteSummaries(routes = [], scanParams) {
    if (!routes.length) {
        return ["NO ROUTES IN BUFFER", "AWAITING QUANTUM UPLINK"];
    }
    const progress = ((scanParams?.scanProgress || 0) * 100).toFixed(1);
    return routes.slice(0, 4).map((route, index) => {
        const confidence = ((route.confidence ?? 0.72) * 100).toFixed(0);
        const delta = (route.delta ?? (Math.sin(index) * 2)).toFixed(1);
        return `${route.name || "SECTOR"} • CONF ${confidence}% • Δ${delta}`;
    }).concat([`SCAN VECTOR ${progress}% SYNCH`]);
}

function buildFluxSummaries(techParams = {}) {
    const energy = techParams.energyLevel ?? 60;
    const coolant = (techParams.coolantPressure ?? 0.48) * 100;
    const shield = (techParams.shieldIntegrity ?? 0.88) * 100;
    const aux = (techParams.auxBoost ?? 0.34) * 100;
    return [
        `ENERGY FIELD ${energy.toFixed(0)}%`,
        `COOLANT FLOW ${coolant.toFixed(1)}%`,
        `SHIELD STABILITY ${shield.toFixed(1)}%`,
        `AUX. BOOST ${aux.toFixed(1)}%`,
    ];
}

function drawStatusTicker(ctx, width, height, time, systemData) {
    const tickerHeight = 44;
    const y = height - tickerHeight - 18;

    ctx.fillStyle = colors.panelBg;
    ctx.fillRect(30, y, width - 60, tickerHeight);
    ctx.strokeStyle = colors.panelBorder;
    ctx.strokeRect(30, y, width - 60, tickerHeight);

    ctx.save();
    ctx.beginPath();
    ctx.rect(34, y + 4, width - 68, tickerHeight - 8);
    ctx.clip();

    const messages = systemData?.statusMessages?.length
        ? systemData.statusMessages
        : [
            "ROUTE OPTIMIZER ONLINE",
            "GRAV LENSING CLEAR",
            "AURORA MESH LOCK STABLE",
            "ENTANGLEMENT CHANNEL OPEN",
        ];

    const scrollSpeed = 80;
    const offset = ((time / 1000) * scrollSpeed) % ((messages.length) * 220);

    ctx.fillStyle = colors.text;
    ctx.font = "13px " + fonts.terminal;
    ctx.textBaseline = "middle";

    messages.forEach((message, index) => {
        const x = width - 80 - offset + index * 220;
        ctx.fillText(message.toUpperCase(), x, y + tickerHeight / 2);
    });

    ctx.restore();
}
