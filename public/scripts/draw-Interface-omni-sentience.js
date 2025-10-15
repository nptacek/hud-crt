export const colors = {
    background: "#040612",
    sphereGlow: "rgba(120, 220, 255, 0.7)",
    orbitLine: "rgba(70, 160, 255, 0.6)",
    humanNode: "#ff9f68",
    aiNode: "#7dffb2",
    videoFrame: "rgba(20, 30, 55, 0.85)",
    videoBorder: "rgba(130, 200, 255, 0.7)",
    radialAnchor: "rgba(80, 200, 255, 0.6)",
    anchorActive: "#ff61e6",
    textPrimary: "#f1faff",
    textSecondary: "#9bb7ff",
    tickerBg: "rgba(14, 18, 34, 0.9)",
    tickerAccent: "#6df1ff",
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
    systemData = systemData || {};
    const timeNow = Date.now();
    const centerX = width / 2;
    const centerY = height / 2;

    drawBackground(ctx, width, height, timeNow);
    drawSphere(ctx, centerX, centerY, timeNow, scanParams);
    drawOrbits(ctx, centerX, centerY, timeNow, systemData);
    drawVideoBillboards(ctx, width, height, timeNow, systemData);
    drawRadialAnchors(ctx, centerX, height, timeNow, systemData);
    drawStatusTicker(ctx, width, height, timeNow, systemData);
}

function drawBackground(ctx, width, height, time) {
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.7);
    gradient.addColorStop(0, "#071024");
    gradient.addColorStop(1, colors.background);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalAlpha = 0.25;
    const stars = 120;
    for (let i = 0; i < stars; i++) {
        const x = ((i * 97.3) % width) + Math.sin(time / 1600 + i) * 10;
        const y = (i * 53.1) % height;
        ctx.fillStyle = `rgba(120, 170, 255, ${(Math.sin(time / 700 + i) * 0.3) + 0.4})`;
        ctx.fillRect(x, y, 2, 2);
    }
    ctx.restore();
}

function drawSphere(ctx, centerX, centerY, time, scanParams) {
    const radius = 140;
    const rotation = (scanParams?.scanProgress || 0) * Math.PI * 2 + time / 4000;

    ctx.save();
    const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.2, centerX, centerY, radius);
    gradient.addColorStop(0, "rgba(150, 240, 255, 0.9)");
    gradient.addColorStop(0.6, colors.sphereGlow);
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1.2;
    const rings = 8;
    for (let i = 0; i <= rings; i++) {
        const lat = (i / rings - 0.5) * Math.PI;
        const y = Math.sin(lat) * radius * 0.8;
        const scale = Math.cos(lat);
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + y, radius * scale, radius * 0.35 * scale, rotation, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.restore();
}

function drawOrbits(ctx, centerX, centerY, time, systemData) {
    const collaborators = systemData?.collaborators || [];
    const orbitCount = Math.max(3, collaborators.length);

    collaborators.slice(0, 10).forEach((member, index) => {
        const orbitRadius = 170 + (index % 3) * 36;
        const isAI = member.type === "ai";
        const angle = time / (2600 - index * 120) + (index / orbitCount) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * orbitRadius;
        const y = centerY + Math.sin(angle) * orbitRadius * 0.65;

        ctx.strokeStyle = colors.orbitLine;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, orbitRadius, orbitRadius * 0.65, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = isAI ? colors.aiNode : colors.humanNode;
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(x, y, 8 + (member.focus || 0.5) * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = colors.textPrimary;
        ctx.font = "11px " + fonts.primary;
        ctx.textAlign = "center";
        ctx.fillText((member.name || (isAI ? "AI" : "HUMAN")), x, y - 14);

        ctx.strokeStyle = isAI ? colors.aiNode : colors.humanNode;
        ctx.lineWidth = 2;
        const focus = member.focus ?? 0.5;
        ctx.beginPath();
        ctx.arc(x, y, 14 + focus * 10, angle, angle + Math.PI * 1.2 * focus);
        ctx.stroke();
    });
}

function drawVideoBillboards(ctx, width, height, time, systemData) {
    const feeds = systemData?.videoFeeds || [];
    const columns = 3;
    const rows = 2;
    const boardWidth = 160;
    const boardHeight = 100;
    const startX = width * 0.08;
    const startY = height * 0.18;
    let index = 0;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const x = startX + col * (boardWidth + 30);
            const y = startY + row * (boardHeight + 30);
            drawBillboard(ctx, x, y, boardWidth, boardHeight, feeds[index], time, index);
            index++;
        }
    }
}

function drawBillboard(ctx, x, y, width, height, feed, time, index) {
    ctx.fillStyle = colors.videoFrame;
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = colors.videoBorder;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, width, height);

    const shimmer = 0.2 + 0.2 * Math.sin(time / 900 + index);
    ctx.fillStyle = `rgba(80, 150, 220, ${shimmer})`;
    ctx.fillRect(x + 10, y + 10, width - 20, height - 30);

    ctx.fillStyle = colors.textSecondary;
    ctx.font = "11px " + fonts.primary;
    ctx.fillText((feed?.title || "STANDBY CHANNEL").toUpperCase(), x + 12, y + height - 12);
}

function drawRadialAnchors(ctx, centerX, height, time, systemData) {
    const anchors = systemData?.contextAnchors || [];
    const radius = 200;
    const baseY = height - 140;
    const count = Math.max(6, anchors.length);

    ctx.save();
    ctx.translate(centerX, baseY);
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.4;
        const anchor = anchors[i] || { name: `CHANNEL ${i + 1}`, active: i === 0 };
        const active = anchor.active || false;

        ctx.strokeStyle = active ? colors.anchorActive : colors.radialAnchor;
        ctx.fillStyle = active ? `rgba(255, 97, 230, 0.25)` : `rgba(80, 200, 255, 0.2)`;
        ctx.beginPath();
        ctx.ellipse(x, y, 60, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = colors.textPrimary;
        ctx.font = "12px " + fonts.header;
        ctx.textAlign = "center";
        ctx.fillText(anchor.name, x, y + 4);

        ctx.font = "10px " + fonts.terminal;
        ctx.fillStyle = colors.textSecondary;
        ctx.fillText(active ? "DEPLOYED" : "HOLD", x, y + 20);
    }
    ctx.restore();
}

function drawStatusTicker(ctx, width, height, time, systemData) {
    const tickerHeight = 46;
    const y = height - tickerHeight - 24;
    ctx.fillStyle = colors.tickerBg;
    ctx.fillRect(60, y, width - 120, tickerHeight);
    ctx.strokeStyle = colors.videoBorder;
    ctx.strokeRect(60, y, width - 120, tickerHeight);

    const items = systemData?.activityLog?.length
        ? systemData.activityLog
        : [
            "HUMAN OPS: DESIGN SPRINT IN FLOW",
            "AI OPS: CODE COMPILATION COMPLETE",
            "PORTAL: VIDEO BRIDGE STABLE",
        ];

    ctx.save();
    ctx.beginPath();
    ctx.rect(64, y + 4, width - 128, tickerHeight - 8);
    ctx.clip();

    const speed = 80;
    const offset = ((time / 1000) * speed) % (items.length * 220);

    ctx.fillStyle = colors.textSecondary;
    ctx.font = "13px " + fonts.terminal;
    ctx.textBaseline = "middle";
    items.forEach((item, index) => {
        const x = width - 140 - offset + index * 220;
        ctx.fillText(item.toUpperCase(), x, y + tickerHeight / 2);
    });
    ctx.restore();
}
