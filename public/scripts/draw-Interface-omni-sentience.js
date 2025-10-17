export const colors = {
    background: "#020611",
    horizonGlow: "rgba(20, 102, 186, 0.45)",
    sphereCore: "rgba(53, 171, 255, 0.35)",
    sphereRing: "rgba(143, 245, 255, 0.6)",
    panelBg: "rgba(6, 28, 60, 0.5)",
    panelStroke: "rgba(70, 200, 255, 0.62)",
    textPrimary: "#e5fbff",
    textSecondary: "rgba(185, 230, 255, 0.86)",
    orbitHuman: "#56ffe4",
    orbitAI: "#ff89ff",
    orbitVideo: "#ffc46e",
    tickerBg: "rgba(8, 20, 40, 0.7)",
    anchorBg: "rgba(32, 90, 180, 0.45)",
    anchorActive: "rgba(96, 220, 255, 0.7)",
    focusTrail: "rgba(86, 255, 228, 0.4)",
    videoBorder: "rgba(255, 198, 110, 0.55)",
    videoFill: "rgba(45, 80, 120, 0.35)",
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

    drawBackground(ctx, width, height, timeNow, chromaticParams);
    drawFrame(ctx, width, height);
    drawHeader(ctx, width, timeNow, systemData);

    drawCollaborationSphere(ctx, centerX, centerY, width, height, systemData, scanParams, timeNow);
    drawBillboards(ctx, width, height, systemData, timeNow);
    drawContextAnchors(ctx, centerX, height, systemData, timeNow);
    drawStatusTicker(ctx, width, height, systemData, timeNow);
    drawCornerDiagnostics(ctx, width, height, techParams, systemData, timeNow);
}

function drawBackground(ctx, width, height, timeNow, chromaticParams) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#050c1a");
    gradient.addColorStop(0.6, colors.background);
    gradient.addColorStop(1, "#01030a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalAlpha = 0.25 + chromaticParams.chromaticAberration * 0.25;
    ctx.strokeStyle = "rgba(80, 140, 255, 0.18)";
    ctx.lineWidth = 0.6;
    const spacing = 40;
    const offset = (timeNow / 150) % spacing;
    for (let x = -spacing; x < width + spacing; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x + offset, 0);
        ctx.lineTo(x + offset, height);
        ctx.stroke();
    }
    for (let y = -spacing; y < height + spacing; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y + offset * 0.7);
        ctx.lineTo(width, y + offset * 0.7);
        ctx.stroke();
    }
    ctx.restore();
}

function drawFrame(ctx, width, height) {
    ctx.save();
    ctx.strokeStyle = colors.panelStroke;
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, width - 32, height - 32);

    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = colors.horizonGlow;
    ctx.strokeRect(32, 32, width - 64, height - 64);
    ctx.restore();
}

function drawHeader(ctx, width, timeNow, systemData) {
    ctx.save();
    ctx.fillStyle = colors.panelBg;
    ctx.fillRect(36, 32, width - 72, 68);
    ctx.strokeStyle = colors.panelStroke;
    ctx.lineWidth = 1.4;
    ctx.strokeRect(36, 32, width - 72, 68);

    ctx.font = `700 20px ${fonts.header}`;
    ctx.fillStyle = colors.textPrimary;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("OMNI-SENTIENCE COLLABORATION SPHERE", 60, 66);

    ctx.textAlign = "right";
    ctx.font = `600 12px ${fonts.primary}`;
    const participants = systemData.participants || [];
    ctx.fillText(`CONNECTED: ${participants.length.toString().padStart(2, "0")}`, width - 60, 58);
    ctx.font = `500 12px ${fonts.primary}`;
    ctx.fillStyle = colors.textSecondary;
    ctx.fillText(`SYNCH ${(systemData.collaborationSync || 0.88).toFixed(2)} • PRESENCE ${(systemData.presencePulse || 0.91).toFixed(2)}`, width - 60, 76);

    ctx.globalAlpha = 0.45 + 0.2 * Math.sin(timeNow / 420);
    ctx.strokeStyle = colors.sphereRing;
    ctx.beginPath();
    ctx.moveTo(60, 92);
    ctx.lineTo(width - 60, 92);
    ctx.stroke();
    ctx.restore();
}

function drawCollaborationSphere(ctx, centerX, centerY, width, height, systemData, scanParams, timeNow) {
    const sphereRadius = Math.min(centerX, centerY) * 0.46;

    ctx.save();
    ctx.translate(centerX, centerY);

    const atmosphereGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, sphereRadius);
    atmosphereGradient.addColorStop(0, colors.sphereCore);
    atmosphereGradient.addColorStop(0.7, "rgba(53, 171, 255, 0.18)");
    atmosphereGradient.addColorStop(1, "rgba(53, 171, 255, 0)");
    ctx.fillStyle = atmosphereGradient;
    ctx.beginPath();
    ctx.arc(0, 0, sphereRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = colors.sphereRing;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(0, 0, sphereRadius, 0, Math.PI * 2);
    ctx.stroke();

    drawSphereLatLong(ctx, sphereRadius, timeNow);
    drawOrbits(ctx, sphereRadius, systemData, timeNow, scanParams);

    ctx.restore();
}

function drawSphereLatLong(ctx, radius, timeNow) {
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = colors.sphereRing;
    ctx.lineWidth = 1;
    const latCount = 8;
    for (let i = 1; i < latCount; i++) {
        const theta = (Math.PI * i) / latCount - Math.PI / 2;
        const r = radius * Math.cos(theta);
        ctx.beginPath();
        ctx.ellipse(0, 0, radius, r, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    const longCount = 12;
    for (let i = 0; i < longCount; i++) {
        const angle = (Math.PI * 2 * i) / longCount + timeNow / 2600;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * Math.sin(angle), radius, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();
}

function drawOrbits(ctx, radius, systemData, timeNow, scanParams) {
    const participants = systemData.participants || [];
    const orbitLevels = 3;

    for (let i = 0; i < participants.length; i++) {
        const participant = participants[i];
        const orbitIndex = i % orbitLevels;
        const orbitRadius = radius * (0.5 + orbitIndex * 0.18);
        const angle = (Math.PI * 2 * (i / participants.length)) + timeNow / (1400 - orbitIndex * 180);
        const x = Math.cos(angle) * orbitRadius;
        const y = Math.sin(angle) * orbitRadius * 0.8;

        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.strokeStyle = participant.type === "AI" ? colors.orbitAI : participant.type === "VIDEO" ? colors.orbitVideo : colors.orbitHuman;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(0, 0, orbitRadius, orbitRadius * 0.8, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = 0.3 + 0.2 * Math.sin(timeNow / 700 + i);
        ctx.strokeStyle = colors.focusTrail;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x * 0.6, y * 0.6);
        ctx.stroke();

        ctx.globalAlpha = 0.8;
        ctx.fillStyle = participant.type === "AI" ? colors.orbitAI : participant.type === "VIDEO" ? colors.orbitVideo : colors.orbitHuman;
        ctx.beginPath();
        ctx.arc(x, y, 10 + orbitIndex * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = colors.textPrimary;
        ctx.font = `600 11px ${fonts.primary}`;
        ctx.textAlign = "center";
        ctx.fillText(participant.name || `NODE-${i + 1}`, x, y - 16);

        ctx.fillStyle = colors.textSecondary;
        ctx.font = `500 10px ${fonts.primary}`;
        ctx.fillText(participant.focus || "OBSERVING", x, y + 18);
        ctx.restore();
    }
}

function drawBillboards(ctx, width, height, systemData, timeNow) {
    const billboards = systemData.videoBillboards || [];
    const count = Math.max(2, billboards.length);
    const baseWidth = 220;
    const baseHeight = 130;

    ctx.save();
    for (let i = 0; i < count; i++) {
        const x = 60 + i * (baseWidth + 24);
        const y = height * 0.2;
        const panel = billboards[i] || { title: `CHANNEL-${i + 1}`, status: "Idle stream", speaker: "--" };
        drawBillboard(ctx, x, y, baseWidth, baseHeight, panel, timeNow, i);
    }

    for (let i = 0; i < count; i++) {
        const x = width - (baseWidth + 60) - i * (baseWidth + 24);
        const y = height * 0.2;
        const panel = billboards[count + i] || { title: `CHANNEL-${count + i + 1}`, status: "Awaiting feed", speaker: "--" };
        drawBillboard(ctx, x, y + 160, baseWidth, baseHeight, panel, timeNow, count + i, true);
    }
    ctx.restore();
}

function drawBillboard(ctx, x, y, width, height, panel, timeNow, index, flip) {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = colors.videoFill;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = colors.videoBorder;
    ctx.lineWidth = 1.4;
    ctx.strokeRect(0, 0, width, height);

    ctx.globalAlpha = 0.5 + 0.3 * Math.sin(timeNow / (600 + index * 120));
    ctx.strokeStyle = colors.orbitVideo;
    ctx.beginPath();
    ctx.moveTo(12, 12);
    ctx.lineTo(width - 12, 12);
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.fillStyle = colors.textPrimary;
    ctx.font = `600 12px ${fonts.primary}`;
    ctx.textAlign = flip ? "right" : "left";
    ctx.fillText(panel.title, flip ? width - 16 : 16, 28);

    ctx.fillStyle = colors.textSecondary;
    ctx.font = `500 11px ${fonts.primary}`;
    ctx.fillText(panel.status, flip ? width - 16 : 16, 48);
    ctx.fillText(`SPEAKER: ${panel.speaker}`, flip ? width - 16 : 16, 64);

    ctx.globalAlpha = 0.35;
    ctx.fillStyle = colors.horizonGlow;
    ctx.fillRect(16, height - 48, width - 32, 32);

    ctx.globalAlpha = 1;
    ctx.fillStyle = colors.textSecondary;
    ctx.font = `600 11px ${fonts.primary}`;
    ctx.textAlign = "center";
    ctx.fillText("EXPAND GESTURE", width / 2, height - 28);

    ctx.restore();
}

function drawContextAnchors(ctx, centerX, height, systemData, timeNow) {
    const anchors = systemData.contextAnchors || ["RESEARCH", "EDIT", "REVIEW", "SYNC"];
    const radius = Math.min(centerX, height * 0.3);
    const baseY = height - 140;

    ctx.save();
    ctx.translate(centerX, baseY);
    ctx.rotate(Math.sin(timeNow / 3200) * 0.04);

    for (let i = 0; i < anchors.length; i++) {
        const angle = (Math.PI * 2 * i) / anchors.length - Math.PI / 2;
        const x = Math.cos(angle) * radius * 0.6;
        const y = Math.sin(angle) * radius * 0.4;
        const active = systemData.activeAnchor === anchors[i];

        ctx.globalAlpha = active ? 0.9 : 0.6;
        ctx.fillStyle = active ? colors.anchorActive : colors.anchorBg;
        ctx.beginPath();
        ctx.ellipse(x, y, 90, 40, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = colors.panelStroke;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(x, y, 90, 40, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = colors.textPrimary;
        ctx.font = `600 13px ${fonts.primary}`;
        ctx.textAlign = "center";
        ctx.fillText(anchors[i], x, y + 4);

        if (active) {
            ctx.globalAlpha = 0.45;
            ctx.strokeStyle = colors.sphereRing;
            ctx.beginPath();
            ctx.arc(0, 0, Math.hypot(x, y) + 60, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    ctx.restore();
}

function drawStatusTicker(ctx, width, height, systemData, timeNow) {
    const tickerHeight = 52;
    const y = height - tickerHeight - 36;

    ctx.save();
    ctx.fillStyle = colors.tickerBg;
    ctx.fillRect(88, y, width - 176, tickerHeight);
    ctx.strokeStyle = colors.panelStroke;
    ctx.lineWidth = 1.3;
    ctx.strokeRect(88, y, width - 176, tickerHeight);

    const updates = systemData.activityStream || [
        "AI COSMA synthesizing design board",
        "Nova editing cinematic lighting cues",
        "Helix preparing holo-call with marketing",
    ];
    const text = updates.join(" • ");

    ctx.font = `600 11px ${fonts.primary}`;
    ctx.fillStyle = colors.textSecondary;
    ctx.textAlign = "left";
    const textWidth = ctx.measureText(text).width;
    const scroll = (timeNow / 18) % (textWidth + 220);

    ctx.save();
    ctx.beginPath();
    ctx.rect(100, y + 10, width - 200, tickerHeight - 20);
    ctx.clip();
    ctx.fillText(text, 100 - scroll, y + tickerHeight / 2 + 4);
    ctx.fillText(text, 100 - scroll + textWidth + 180, y + tickerHeight / 2 + 4);
    ctx.restore();

    ctx.textAlign = "right";
    ctx.font = `600 12px ${fonts.primary}`;
    ctx.fillStyle = colors.textSecondary;
    ctx.fillText(`LATENCY ${(systemData.sharedLatency || 14).toFixed(0)}MS`, width - 104, y + tickerHeight / 2 + 4);
    ctx.restore();
}

function drawCornerDiagnostics(ctx, width, height, techParams, systemData, timeNow) {
    ctx.save();
    ctx.font = `600 11px ${fonts.primary}`;
    ctx.fillStyle = colors.textSecondary;
    ctx.textAlign = "left";

    const leftItems = [
        `HAPTIC ${(techParams.hapticGain || 0.72).toFixed(2)}`,
        `MUTUAL ${(systemData.mutualFocus || 0.87).toFixed(2)}`,
        `CHANNEL ${(systemData.channelCount || 4).toString().padStart(2, "0")}`,
    ];
    leftItems.forEach((text, index) => {
        ctx.globalAlpha = 0.6 + 0.25 * Math.sin(timeNow / (540 + index * 180));
        ctx.fillText(text, 48, height - 96 + index * 18);
    });

    ctx.textAlign = "right";
    const rightItems = [
        `AI NODES ${(systemData.aiNodes || 3).toString().padStart(2, "0")}`,
        `TRUST ${(systemData.trustScore || 0.93).toFixed(2)}`,
        `COALESCE ${(techParams.coalesceRatio || 0.82).toFixed(2)}`,
    ];
    rightItems.forEach((text, index) => {
        ctx.globalAlpha = 0.55 + 0.3 * Math.sin(timeNow / (620 + index * 200));
        ctx.fillText(text, width - 48, height - 96 + index * 18);
    });

    ctx.restore();
}
