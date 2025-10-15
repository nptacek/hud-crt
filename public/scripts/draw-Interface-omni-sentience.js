export const colors = {
    background: "#01040c",
    gradientTop: "#021226",
    gradientBottom: "#030918",
    orbitLine: "rgba(0, 214, 255, 0.5)",
    orbitHighlight: "rgba(255, 120, 255, 0.6)",
    nodeHuman: "#5bffea",
    nodeAI: "#ff8bff",
    billboardBg: "rgba(8, 24, 48, 0.75)",
    billboardBorder: "rgba(0, 214, 255, 0.6)",
    anchorTile: "rgba(5, 16, 32, 0.8)",
    anchorBorder: "rgba(255, 255, 255, 0.2)",
    tickerBg: "rgba(0, 26, 46, 0.8)",
    tickerText: "#6ef9ff",
    textPrimary: "#d6f6ff",
    textSecondary: "rgba(214, 246, 255, 0.7)",
};

export const fonts = {
    primary: "'Courier New', 'Courier', monospace",
    header: "bold 18px 'Courier New', 'Courier', monospace",
    terminal: "12px 'Courier New', 'Courier', monospace",
    mini: "10px 'Courier New', 'Courier', monospace",
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
    const centerY = height / 2 - 20;
    const timeNow = Date.now();

    drawAtmosphere(ctx, width, height, timeNow);
    drawSphere(ctx, centerX, centerY, timeNow, scanParams);
    drawOrbits(ctx, centerX, centerY, timeNow, systemData, techParams);
    drawBillboards(ctx, width, height, centerX, centerY, timeNow, systemData);
    drawAnchors(ctx, centerX, height - 140, timeNow, systemData, techParams);
    drawAmbientTicker(ctx, width, height, timeNow, systemData);
}

function drawAtmosphere(ctx, width, height, time) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, colors.gradientTop);
    gradient.addColorStop(1, colors.gradientBottom);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const stars = 120;
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    for (let i = 0; i < stars; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height * 0.6;
        const size = Math.random() * 1.5;
        const flicker = Math.sin(time / 600 + x * 0.03 + y * 0.01) * 0.3 + 0.7;
        ctx.globalAlpha = flicker;
        ctx.fillRect(x, y, size, size);
    }
    ctx.globalAlpha = 1;
}

function drawSphere(ctx, x, y, time, scanParams) {
    const scan = scanParams?.scanProgress ?? 0.5;
    const radius = 160;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(0, 214, 255, ${0.4 + scan * 0.3})`);
    gradient.addColorStop(0.6, "rgba(0, 214, 255, 0.2)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    const latLines = 6;
    const lonLines = 8;

    ctx.strokeStyle = colors.orbitHighlight;
    ctx.lineWidth = 1;

    for (let i = 1; i < latLines; i++) {
        const lat = (i / latLines) * Math.PI - Math.PI / 2;
        const r = Math.cos(lat) * radius;
        const offset = Math.sin(time / 1800 + i) * 12;
        ctx.beginPath();
        ctx.ellipse(x, y + offset, r, r * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    for (let j = 0; j < lonLines; j++) {
        const angle = (Math.PI * 2 * j) / lonLines + time / 2000;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let k = -radius; k <= radius; k += 12) {
            const factor = Math.sqrt(1 - (k / radius) ** 2) || 0;
            const px = x + Math.cos(angle) * factor * radius;
            const py = y + k;
            ctx.lineTo(px, py);
        }
        ctx.stroke();
    }

    ctx.fillStyle = colors.textPrimary;
    ctx.font = fonts.header;
    ctx.fillText("OMNI-SENTIENCE", x - 110, y - radius - 30);
    ctx.font = fonts.terminal;
    ctx.fillStyle = colors.textSecondary;
    ctx.fillText("COLLABORATION SPHERE", x - 100, y - radius - 12);
}

function drawOrbits(ctx, x, y, time, systemData, techParams) {
    const collaborators = systemData?.collaborators ?? getFallbackCollaborators();
    const orbitBaseRadius = 110;
    const orbitGap = 28;

    collaborators.forEach((collab, idx) => {
        const orbitRadius = orbitBaseRadius + idx * orbitGap;
        const tilt = Math.sin(time / 3500 + idx) * 0.2;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(tilt);
        ctx.strokeStyle = colors.orbitLine;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, orbitRadius, orbitRadius * 0.6, 0, 0, Math.PI * 2);
        ctx.stroke();

        const angle = time / 1200 + idx * 0.8 + collab.offset;
        const px = Math.cos(angle) * orbitRadius;
        const py = Math.sin(angle) * orbitRadius * 0.6;

        ctx.fillStyle = collab.type === "AI" ? colors.nodeAI : colors.nodeHuman;
        ctx.beginPath();
        ctx.arc(px, py, collab.type === "AI" ? 9 : 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = collab.type === "AI" ? colors.orbitHighlight : colors.orbitLine;
        ctx.beginPath();
        ctx.arc(px, py, 14 + Math.sin(time / 400 + idx) * 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = colors.textPrimary;
        ctx.font = fonts.mini;
        ctx.fillText(collab.name, px + 12, py - 6);
        ctx.fillStyle = colors.textSecondary;
        ctx.fillText(collab.focus, px + 12, py + 6);

        ctx.restore();

        if (collab.stream) {
            drawStreamThread(ctx, x, y, px + x, py + y, time, collab);
        }
    });

    const sync = techParams?.synchrony ?? 0.74;
    ctx.fillStyle = colors.textSecondary;
    ctx.font = fonts.terminal;
    ctx.fillText(`SYNC ${(sync * 100).toFixed(1)}%`, x - 40, y + orbitBaseRadius + collaborators.length * orbitGap + 24);
}

function drawStreamThread(ctx, x, y, px, py, time, collab) {
    const controlOffset = 60;
    const cp1X = x + (px - x) * 0.4 + controlOffset;
    const cp1Y = y - controlOffset;
    const cp2X = x + (px - x) * 0.6 - controlOffset;
    const cp2Y = py + controlOffset * 0.6;

    ctx.strokeStyle = collab.type === "AI" ? colors.orbitHighlight : colors.orbitLine;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, px, py);
    ctx.stroke();

    const packetPos = ((time / 900) + collab.offset) % 1;
    const packetX = bezierPoint(packetPos, x, cp1X, cp2X, px);
    const packetY = bezierPoint(packetPos, y, cp1Y, cp2Y, py);

    ctx.fillStyle = collab.type === "AI" ? colors.nodeAI : colors.nodeHuman;
    ctx.beginPath();
    ctx.arc(packetX, packetY, 4, 0, Math.PI * 2);
    ctx.fill();
}

function drawBillboards(ctx, width, height, centerX, centerY, time, systemData) {
    const feeds = systemData?.liveFeeds ?? getFallbackFeeds();
    const billboardWidth = 200;
    const billboardHeight = 120;
    const y = 80;

    feeds.forEach((feed, idx) => {
        const x = idx === 0 ? 60 : width - billboardWidth - 60;
        const wobble = Math.sin(time / 1600 + idx) * 6;

        ctx.fillStyle = colors.billboardBg;
        ctx.strokeStyle = colors.billboardBorder;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        drawRoundedRectPath(ctx, x, y + wobble, billboardWidth, billboardHeight, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = colors.textPrimary;
        ctx.font = fonts.primary;
        ctx.fillText(feed.title, x + 18, y + 28 + wobble);

        ctx.fillStyle = colors.textSecondary;
        ctx.font = fonts.terminal;
        wrapText(ctx, feed.summary, x + 18, y + 46 + wobble, billboardWidth - 36, 16);

        const progress = feed.progress ?? 0.4;
        ctx.strokeStyle = colors.orbitHighlight;
        ctx.strokeRect(x + 18, y + billboardHeight - 28 + wobble, billboardWidth - 36, 10);
        ctx.fillStyle = colors.nodeHuman;
        ctx.fillRect(x + 18, y + billboardHeight - 28 + wobble, (billboardWidth - 36) * progress, 10);

        ctx.fillStyle = colors.textSecondary;
        ctx.font = fonts.mini;
        ctx.fillText(feed.status, x + 18, y + billboardHeight - 36 + wobble);
    });
}

function drawAnchors(ctx, centerX, baseY, time, systemData, techParams) {
    const anchors = systemData?.contextAnchors ?? getFallbackAnchors();
    const radius = 150;
    const count = anchors.length;

    anchors.forEach((anchor, idx) => {
        const angle = Math.PI + (Math.PI * idx) / Math.max(count - 1, 1);
        const x = centerX + Math.cos(angle) * radius;
        const y = baseY + Math.sin(angle) * 30 + Math.sin(time / 1200 + idx) * 4;

        ctx.fillStyle = colors.anchorTile;
        ctx.strokeStyle = colors.anchorBorder;
        ctx.lineWidth = 1;
        ctx.beginPath();
        drawRoundedRectPath(ctx, x - 60, y - 24, 120, 48, 10);
        ctx.fill();
        ctx.stroke();

        const progress = anchor.progress ?? 0.5;
        const arcStart = Math.PI;
        const arcEnd = arcStart + Math.PI * progress;
        ctx.strokeStyle = colors.orbitHighlight;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, baseY, radius + 20, arcStart, arcEnd);
        ctx.stroke();

        ctx.fillStyle = colors.textPrimary;
        ctx.font = fonts.terminal;
        ctx.fillText(anchor.label, x - ctx.measureText(anchor.label).width / 2, y - 4);
        ctx.fillStyle = colors.textSecondary;
        ctx.font = fonts.mini;
        ctx.fillText(anchor.detail, x - ctx.measureText(anchor.detail).width / 2, y + 12);
    });

    const mode = techParams?.handoffMode ?? "GLIDE";
    ctx.fillStyle = colors.textSecondary;
    ctx.font = fonts.terminal;
    ctx.fillText(`HANDOFF MODE ${mode}`, centerX - 70, baseY + 80);
}

function drawAmbientTicker(ctx, width, height, time, systemData) {
    const y = height - 60;
    ctx.fillStyle = colors.tickerBg;
    ctx.fillRect(60, y, width - 120, 40);
    ctx.strokeStyle = colors.billboardBorder;
    ctx.strokeRect(60, y, width - 120, 40);

    const updates = systemData?.liveSummaries ?? getFallbackSummaries();
    const combined = updates.join("  |  ");
    const scrollWidth = ctx.measureText(combined).width + width;
    const offset = (time / 12) % scrollWidth;

    ctx.save();
    ctx.beginPath();
    ctx.rect(64, y + 6, width - 128, 28);
    ctx.clip();

    ctx.font = fonts.terminal;
    ctx.fillStyle = colors.tickerText;
    ctx.fillText(combined, 64 - offset, y + 24);
    ctx.fillText(combined, 64 - offset + scrollWidth, y + 24);

    ctx.restore();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    if (!text) return;
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

function bezierPoint(t, p0, p1, p2, p3) {
    const mt = 1 - t;
    return (
        mt * mt * mt * p0 +
        3 * mt * mt * t * p1 +
        3 * mt * t * t * p2 +
        t * t * t * p3
    );
}

function getFallbackCollaborators() {
    return [
        { name: "YOU", type: "HUMAN", focus: "WORLD DESIGN", offset: 0, stream: true },
        { name: "LYRA", type: "AI", focus: "CODE SYNTH", offset: 0.3, stream: true },
        { name: "ORBIT", type: "AI", focus: "RESEARCH", offset: 0.6, stream: false },
        { name: "RIN", type: "HUMAN", focus: "STORY", offset: 0.9, stream: true },
    ];
}

function getFallbackFeeds() {
    return [
        {
            title: "NEURAL HUD STANDUP",
            summary: "Live transcript uplink ready for playback. Swipe to expand the volumetric feed.",
            progress: 0.72,
            status: "SYNCED",
        },
        {
            title: "CLIENT PORTAL",
            summary: "Video wall anchored to east quadrant. Gesture to project into shared atrium.",
            progress: 0.44,
            status: "IDLE",
        },
    ];
}

function getFallbackAnchors() {
    return [
        { label: "DEV WALL", detail: "3 THREADS ACTIVE", progress: 0.45 },
        { label: "STORY LOOM", detail: "SCENE 12", progress: 0.68 },
        { label: "ARCHIVE", detail: "GHOST RECORD", progress: 0.88 },
    ];
}

function getFallbackSummaries() {
    return [
        "Lyra: compiled haptic mapper patch",
        "Orbit: surfaced 3 research briefs",
        "Rin: story beat revision ready",
        "You: sculpting synaptic forge gesture set",
    ];
}
