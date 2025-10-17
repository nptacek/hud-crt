export const colors = {
    background: "#040815",
    innerGlow: "rgba(26, 82, 157, 0.45)",
    sphereCore: "rgba(102, 204, 255, 0.75)",
    sphereWire: "rgba(255, 255, 255, 0.3)",
    orbitHuman: "rgba(102, 255, 204, 0.9)",
    orbitAI: "rgba(255, 160, 255, 0.9)",
    orbitTrail: "rgba(102, 255, 204, 0.3)",
    billboardBg: "rgba(14, 28, 64, 0.8)",
    billboardBorder: "rgba(102, 204, 255, 0.55)",
    textPrimary: "#e9f6ff",
    textSecondary: "rgba(233, 246, 255, 0.65)",
    textAccent: "#7df9ff",
    radialAnchor: "rgba(102, 204, 255, 0.6)",
    radialAccent: "rgba(255, 180, 255, 0.6)",
    tickerBg: "rgba(10, 20, 40, 0.85)",
    tickerBorder: "rgba(102, 204, 255, 0.5)",
    scanline: "rgba(102, 204, 255, 0.06)",
    orbitGlow: "rgba(255, 255, 255, 0.4)",
    videoOverlay: "rgba(20, 40, 80, 0.4)",
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
    const centerY = height * 0.48;
    const timeNow = Date.now();

    drawBackground(ctx, width, height, centerX, centerY);
    drawSphere(ctx, centerX, centerY, width, height, timeNow, systemData);
    drawOrbits(ctx, centerX, centerY, timeNow, systemData, scanParams);
    drawBillboards(ctx, width, height, centerY, timeNow, systemData);
    drawRadialAnchors(ctx, centerX, height, timeNow, systemData, techParams);
    drawTicker(ctx, width, height, timeNow, systemData);
    drawHeader(ctx, width, timeNow, systemData);
    drawCornerStats(ctx, width, height, timeNow, chromaticParams);
    drawScanlines(ctx, width, height, timeNow);
}

function drawBackground(ctx, width, height, centerX, centerY) {
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, width, height);

    const radial = ctx.createRadialGradient(centerX, centerY, height * 0.1, centerX, centerY, height);
    radial.addColorStop(0, colors.innerGlow);
    radial.addColorStop(0.4, "rgba(4, 8, 21, 0.85)");
    radial.addColorStop(1, "rgba(4, 8, 21, 1)");
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);
}

function drawSphere(ctx, centerX, centerY, width, height, time, systemData) {
    ctx.save();
    const sphereRadius = Math.min(width, height) * 0.22;
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, sphereRadius);
    gradient.addColorStop(0, colors.sphereCore);
    gradient.addColorStop(0.6, "rgba(102, 204, 255, 0.2)");
    gradient.addColorStop(1, "rgba(102, 204, 255, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, sphereRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = colors.sphereWire;
    ctx.lineWidth = 1.4;
    const meridians = 8;
    const parallels = 6;
    ctx.globalAlpha = 0.55;
    for (let m = 0; m < meridians; m++) {
        const angle = (m / meridians) * Math.PI + time / 5000;
        ctx.beginPath();
        for (let i = -90; i <= 90; i += 6) {
            const lat = (i * Math.PI) / 180;
            const x = centerX + sphereRadius * Math.cos(lat) * Math.cos(angle);
            const y = centerY + sphereRadius * Math.sin(lat);
            if (i === -90) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }

    for (let p = 0; p <= parallels; p++) {
        const phi = (p / parallels) * Math.PI - Math.PI / 2;
        const radius = sphereRadius * Math.cos(phi);
        const y = centerY + sphereRadius * Math.sin(phi);
        ctx.beginPath();
        ctx.ellipse(centerX, y, radius, radius * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.globalAlpha = 1;
    ctx.fillStyle = colors.textPrimary;
    ctx.font = `18px ${fonts.header}`;
    ctx.textAlign = "center";
    ctx.fillText(
        systemData?.hubName || "OMNI-SENTIENCE ATRIUM",
        centerX,
        centerY - sphereRadius - 24
    );

    ctx.fillStyle = colors.textSecondary;
    ctx.font = `11px ${fonts.terminal}`;
    ctx.fillText(
        `SYNC ${((systemData?.syncState || 0.82) * 100).toFixed(1)}% • LAT ${(Math.sin(time / 1400) * 12 + 38).toFixed(1)}ms`,
        centerX,
        centerY - sphereRadius - 8
    );
    ctx.restore();
}

function drawOrbits(ctx, centerX, centerY, time, systemData, scanParams) {
    const participants = systemData?.participants || [
        { name: "YOU", role: "HUMAN", focus: "BUILD", orbit: 0.95 },
        { name: "ORION", role: "AI", focus: "CODE", orbit: 1.15 },
        { name: "LYRA", role: "HUMAN", focus: "DESIGN", orbit: 1.35 },
        { name: "ECHO", role: "AI", focus: "RESEARCH", orbit: 1.55 },
    ];

    const baseRadius = Math.min(centerX, centerY) * 0.9;
    participants.forEach((participant, index) => {
        const orbitRadius = baseRadius * participant.orbit;
        const angularSpeed = (participant.role === "AI" ? 1.4 : 1) * 0.0006;
        const angle = time * angularSpeed + index * 1.3;

        ctx.save();
        ctx.strokeStyle = colors.orbitTrail;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, orbitRadius, orbitRadius * 0.6, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        const x = centerX + Math.cos(angle) * orbitRadius;
        const y = centerY + Math.sin(angle) * orbitRadius * 0.6;
        const isAI = participant.role === "AI";
        ctx.save();
        ctx.fillStyle = isAI ? colors.orbitAI : colors.orbitHuman;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = colors.orbitGlow;
        ctx.lineWidth = 1.4;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(x, y, 20 + Math.sin(time / 400 + index) * 3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = colors.textPrimary;
        ctx.font = `10px ${fonts.header}`;
        ctx.textAlign = "center";
        ctx.fillText(participant.name, x, y - 24);
        ctx.fillStyle = colors.textSecondary;
        ctx.font = `9px ${fonts.terminal}`;
        ctx.fillText(`${participant.role} • ${participant.focus}`, x, y - 10);

        drawFocusThread(ctx, centerX, centerY, x, y, index, time, scanParams);
        ctx.restore();
    });
}

function drawFocusThread(ctx, centerX, centerY, x, y, index, time, scanParams) {
    ctx.save();
    const points = 24;
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
        const t = i / points;
        const wave = Math.sin(time / 500 + index + t * Math.PI * 2) * 8 * (1 - t);
        const px = centerX + (x - centerX) * t + wave;
        const py = centerY + (y - centerY) * t - wave * 0.5;
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    const gradient = ctx.createLinearGradient(centerX, centerY, x, y);
    gradient.addColorStop(0, colors.orbitTrail);
    gradient.addColorStop(1, colors.orbitHuman);
    ctx.strokeStyle = gradient;
    ctx.globalAlpha = 0.55 + 0.25 * (scanParams?.scanProgress || 0);
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.restore();
}

function drawBillboards(ctx, width, height, centerY, time, systemData) {
    const billboards = systemData?.billboards || [
        { label: "MEETING STREAM", status: "LIVE", side: "left" },
        { label: "DESIGN REVIEW", status: "PAUSED", side: "right" },
    ];

    const billboardWidth = 220;
    const billboardHeight = 140;
    billboards.forEach((board, index) => {
        const x = board.side === "left" ? 60 : width - billboardWidth - 60;
        const y = centerY - 70 + index * (billboardHeight + 20);
        const oscillation = Math.sin(time / 1600 + index) * 6;

        ctx.save();
        ctx.fillStyle = colors.billboardBg;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(x, y + oscillation, billboardWidth, billboardHeight);

        ctx.strokeStyle = colors.billboardBorder;
        ctx.lineWidth = 1.4;
        ctx.globalAlpha = 1;
        ctx.strokeRect(x, y + oscillation, billboardWidth, billboardHeight);

        ctx.fillStyle = colors.textPrimary;
        ctx.font = `13px ${fonts.header}`;
        ctx.textAlign = "left";
        ctx.fillText(board.label, x + 16, y + oscillation + 28);

        ctx.fillStyle = colors.textSecondary;
        ctx.font = `10px ${fonts.terminal}`;
        ctx.fillText(`STATUS ${board.status}`, x + 16, y + oscillation + 46);

        ctx.fillStyle = colors.videoOverlay;
        ctx.fillRect(x + 16, y + oscillation + 60, billboardWidth - 32, 56);

        ctx.strokeStyle = colors.textAccent;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.6 + 0.3 * Math.sin(time / 700 + index);
        ctx.strokeRect(x + 16, y + oscillation + 60, billboardWidth - 32, 56);
        ctx.restore();
    });
}

function drawRadialAnchors(ctx, centerX, height, time, systemData, techParams) {
    ctx.save();
    const baseY = height - 120;
    const radius = 140;
    const anchors = systemData?.anchors || [
        { label: "CODE", angle: -70 },
        { label: "DESIGN", angle: -20 },
        { label: "RESEARCH", angle: 30 },
        { label: "SOCIAL", angle: 80 },
    ];

    ctx.translate(centerX, baseY);
    ctx.strokeStyle = colors.radialAnchor;
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, radius, Math.PI, 0, false);
    ctx.stroke();

    anchors.forEach((anchor, index) => {
        const angle = (anchor.angle * Math.PI) / 180;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        ctx.fillStyle = colors.radialAnchor;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = colors.radialAccent;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(x, y, 20 + Math.sin(time / 600 + index) * 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = colors.textPrimary;
        ctx.font = `10px ${fonts.header}`;
        ctx.textAlign = "center";
        ctx.fillText(anchor.label, x, y - 26);

        ctx.fillStyle = colors.textSecondary;
        ctx.font = `9px ${fonts.terminal}`;
        const status = techParams?.anchorStatus?.[anchor.label.toLowerCase()] ?? 0.6;
        ctx.fillText(`LOCK ${(status * 100).toFixed(0)}%`, x, y - 12);
    });
    ctx.restore();
}

function drawTicker(ctx, width, height, time, systemData) {
    ctx.save();
    ctx.fillStyle = colors.tickerBg;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(60, height - 60, width - 120, 44);

    ctx.strokeStyle = colors.tickerBorder;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 1;
    ctx.strokeRect(60, height - 60, width - 120, 44);

    ctx.fillStyle = colors.textPrimary;
    ctx.font = `11px ${fonts.header}`;
    ctx.textAlign = "left";
    ctx.fillText("COLLAB LIVE FEED", 80, height - 34);

    const updates = systemData?.activityFeed || [
        "LYRA pinned a reference moodboard",
        "ORION pushed agent patch v4.12",
        "ECHO summarized research thread",
    ];

    ctx.save();
    ctx.beginPath();
    ctx.rect(220, height - 56, width - 300, 36);
    ctx.clip();

    const scroll = (time / 18) % (width - 240);
    ctx.fillStyle = colors.textSecondary;
    ctx.font = `11px ${fonts.terminal}`;
    updates.forEach((update, index) => {
        const x = width - 120 - scroll + index * 260;
        ctx.fillText(update, x, height - 32);
    });
    ctx.restore();
    ctx.restore();
}

function drawHeader(ctx, width, time, systemData) {
    ctx.save();
    ctx.fillStyle = colors.billboardBg;
    ctx.globalAlpha = 0.9;
    ctx.fillRect(40, 24, width - 80, 70);

    ctx.strokeStyle = colors.billboardBorder;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 1;
    ctx.strokeRect(40, 24, width - 80, 70);

    ctx.fillStyle = colors.textPrimary;
    ctx.font = `26px ${fonts.header}`;
    ctx.textAlign = "center";
    ctx.fillText("OMNI-SENTIENCE COLLABORATION SPHERE", width / 2, 58);

    ctx.fillStyle = colors.textSecondary;
    ctx.font = `11px ${fonts.terminal}`;
    const occupantCount = (systemData?.participants || []).length;
    ctx.fillText(`${occupantCount} ENTITIES LINKED • TRUST ${(Math.sin(time / 2000) * 0.1 + 0.9).toFixed(2)}`, width / 2, 80);
    ctx.restore();
}

function drawCornerStats(ctx, width, height, time, chromaticParams) {
    ctx.save();
    ctx.fillStyle = colors.billboardBg;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(40, height - 110, 180, 72);
    ctx.fillRect(width - 220, height - 110, 180, 72);

    ctx.strokeStyle = colors.billboardBorder;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 1;
    ctx.strokeRect(40, height - 110, 180, 72);
    ctx.strokeRect(width - 220, height - 110, 180, 72);

    const leftMetrics = [
        `FOCUS ${(chromaticParams?.offset || 0.32).toFixed(2)}`,
        `RES ${(Math.sin(time / 1500) * 20 + 64).toFixed(0)}k`,
        `BAND ${(Math.cos(time / 1700) * 18 + 48).toFixed(0)}%`,
    ];
    const rightMetrics = [
        `PRESENCE ${(Math.sin(time / 2100) * 0.3 + 0.7).toFixed(2)}`,
        `GRAIN ${(chromaticParams?.grain || 0.08).toFixed(2)}`,
        `COOP ${(Math.cos(time / 1200) * 0.2 + 0.8).toFixed(2)}`,
    ];

    ctx.fillStyle = colors.textSecondary;
    ctx.font = `10px ${fonts.terminal}`;
    ctx.textAlign = "left";
    leftMetrics.forEach((metric, index) => {
        ctx.fillText(metric, 56, height - 88 + index * 20);
    });

    ctx.textAlign = "right";
    rightMetrics.forEach((metric, index) => {
        ctx.fillText(metric, width - 56, height - 88 + index * 20);
    });
    ctx.restore();
}

function drawScanlines(ctx, width, height, time) {
    ctx.save();
    ctx.fillStyle = colors.scanline;
    const offset = (time / 70) % 6;
    for (let y = 0; y < height; y += 6) {
        ctx.fillRect(0, y + offset, width, 2);
    }
    ctx.restore();
}
