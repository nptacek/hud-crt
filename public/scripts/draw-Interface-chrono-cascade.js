export const colors = {
    background: "#020307",
    frame: "#0b1a2f",
    frameGlow: "rgba(32, 128, 255, 0.5)",
    accent: "#00b7ff",
    accentSoft: "rgba(0, 183, 255, 0.4)",
    lime: "#5bffae",
    amber: "#ffc860",
    magenta: "#ff66cc",
    slate: "rgba(10, 25, 44, 0.65)",
    cardBg: "rgba(8, 26, 46, 0.75)",
    cardBorder: "rgba(0, 183, 255, 0.6)",
    gridLines: "rgba(0, 60, 120, 0.4)",
    shadow: "rgba(0, 0, 0, 0.35)",
    aiPulse: "rgba(91, 255, 174, 0.45)",
};

export const fonts = {
    primary: "'Courier New', 'Courier', monospace",
    header: "bold 16px 'Courier New', 'Courier', monospace",
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
    const timeNow = Date.now();

    drawCascadeBackground(ctx, width, height, timeNow);
    drawOuterFrame(ctx, width, height);

    const timelineX = width / 2;
    drawCascadeTimeline(ctx, timelineX, height, timeNow, systemData);
    drawTimelineCards(ctx, timelineX, height, timeNow, systemData, scanParams);

    drawControlColumn(ctx, 60, height, timeNow, techParams, true);
    drawControlColumn(ctx, width - 200, height, timeNow, techParams, false);

    drawAITicker(ctx, width, height, timeNow, systemData, techParams);
}

function drawCascadeBackground(ctx, width, height, time) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#01040a");
    gradient.addColorStop(0.4, colors.background);
    gradient.addColorStop(1, "#040b16");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = colors.gridLines;
    ctx.lineWidth = 1;
    const columnWidth = 80;
    for (let x = 0; x <= width; x += columnWidth) {
        ctx.beginPath();
        ctx.moveTo(x, 40);
        ctx.lineTo(x + Math.sin(time / 2000 + x * 0.05) * 10, height - 40);
        ctx.stroke();
    }

    for (let y = 60; y < height; y += 60) {
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(width - 40, y);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
}

function drawOuterFrame(ctx, width, height) {
    ctx.strokeStyle = colors.frameGlow;
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1;
    ctx.strokeRect(32, 32, width - 64, height - 64);
}

function drawCascadeTimeline(ctx, x, height, time, systemData) {
    const top = 80;
    const bottom = height - 120;

    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();

    const glow = 8 + Math.sin(time / 400) * 3;
    const gradient = ctx.createRadialGradient(x, top + 10, 0, x, top + 10, glow);
    gradient.addColorStop(0, colors.accent);
    gradient.addColorStop(1, "rgba(0, 183, 255, 0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, top + 10, glow, 0, Math.PI * 2);
    ctx.fill();

    const stages = systemData?.workflowStages ?? [];
    const spacing = (bottom - top) / Math.max(stages.length, 6);

    ctx.fillStyle = colors.accent;
    ctx.font = `bold 12px ${fonts.primary}`;
    ctx.fillText("NOW", x + 18, top + 6);
    ctx.fillText("ARCHIVE", x + 18, bottom + 14);

    for (let i = 0; i <= 5; i++) {
        const y = top + i * spacing;
        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = colors.accentSoft;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - 12, y);
        ctx.lineTo(x + 12, y);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
}

function drawTimelineCards(ctx, x, height, time, systemData, scanParams) {
    const stages = systemData?.workflowStages ?? getFallbackStages();
    const top = 110;
    const bottom = height - 160;
    const columnWidth = 200;
    const spacing = (bottom - top) / Math.max(stages.length - 1, 1);

    stages.forEach((stage, idx) => {
        const y = top + idx * spacing;
        const offset = (idx % 2 === 0 ? -1 : 1) * (120 + Math.sin(time / 1400 + idx) * 12);
        const cardX = x + offset - columnWidth / 2;
        const cardY = y - 40;
        const cardHeight = 80;

        const momentum = stage.momentum ?? 0.5;
        const aiAssist = stage.aiAssist ?? 0.4;
        const scanGlow = (scanParams?.scanProgress ?? 0) * 0.5;

        ctx.save();
        ctx.shadowColor = colors.shadow;
        ctx.shadowBlur = 8;
        ctx.fillStyle = colors.cardBg;
        ctx.strokeStyle = colors.cardBorder;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        drawRoundedRectPath(ctx, cardX, cardY, columnWidth, cardHeight, 12);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        ctx.font = `bold 13px ${fonts.primary}`;
        ctx.fillStyle = colors.lime;
        ctx.fillText(stage.title, cardX + 14, cardY + 20);

        ctx.font = fonts.terminal;
        ctx.fillStyle = colors.accent;
        ctx.fillText(stage.timestamp ?? "--:--", cardX + columnWidth - 70, cardY + 20);

        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        wrapText(ctx, stage.preview, cardX + 14, cardY + 38, columnWidth - 28, 14);

        const sliderY = cardY + cardHeight - 20;
        const sliderWidth = columnWidth - 28;
        ctx.strokeStyle = colors.accentSoft;
        ctx.strokeRect(cardX + 14, sliderY, sliderWidth, 8);
        ctx.fillStyle = colors.lime;
        ctx.fillRect(cardX + 14, sliderY, sliderWidth * momentum, 8);

        const knobX = cardX + 14 + sliderWidth * aiAssist;
        const knobPulse = 4 + Math.sin(time / 300 + idx) * 1.5 + scanGlow * 10;
        ctx.fillStyle = colors.aiPulse;
        ctx.beginPath();
        ctx.arc(knobX, sliderY + 4, knobPulse * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = colors.magenta;
        ctx.font = fonts.mini;
        ctx.fillText(stage.status ?? "PENDING", cardX + 14, cardY + cardHeight - 4);
    });
}

function drawControlColumn(ctx, x, height, time, techParams, isLeft) {
    const columnHeight = height - 220;
    const top = 100;
    const modules = 4;
    const spacing = columnHeight / modules;

    for (let i = 0; i < modules; i++) {
        const moduleY = top + i * spacing;
        const moduleHeight = spacing - 20;
        const moduleWidth = 160;
        const wobble = Math.sin(time / 1200 + i * 1.7) * 6;
        const offsetX = isLeft ? wobble : -wobble;

        ctx.fillStyle = colors.slate;
        ctx.strokeStyle = colors.cardBorder;
        ctx.beginPath();
        drawRoundedRectPath(ctx, x + offsetX, moduleY, moduleWidth, moduleHeight, 10);
        ctx.fill();
        ctx.stroke();

        ctx.font = fonts.terminal;
        ctx.fillStyle = colors.accent;
        const label = isLeft ? leftControlLabels[i] : rightControlLabels[i];
        ctx.fillText(label, x + offsetX + 12, moduleY + 18);

        if (i === 0) {
            drawLever(ctx, x + offsetX + moduleWidth / 2, moduleY + moduleHeight / 2, time, techParams);
        } else if (i === 1) {
            drawSlider(ctx, x + offsetX + 20, moduleY + moduleHeight / 2, moduleWidth - 40, time, techParams, isLeft);
        } else if (i === 2) {
            drawDial(ctx, x + offsetX + moduleWidth / 2, moduleY + moduleHeight / 2 + 10, time, techParams, isLeft);
        } else {
            drawSwitchMatrix(ctx, x + offsetX + 20, moduleY + 32, moduleWidth - 40, moduleHeight - 44, time, techParams);
        }
    }
}

const leftControlLabels = [
    "GESTURE LEVER",
    "SYNTH SLIDER",
    "FOCUS DIAL",
    "MACRO SWITCHES",
];

const rightControlLabels = [
    "AI ASSIST",
    "FLOW RATE",
    "TIMELINE DIAL",
    "ROUTINE ARRAY",
];

function drawLever(ctx, x, y, time, techParams) {
    const gesture = techParams?.gestureLean ?? 0.5;
    const angle = -Math.PI / 4 + gesture * (Math.PI / 2);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.sin(time / 1500) * 0.05);

    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.lineTo(0, -30);
    ctx.stroke();

    ctx.fillStyle = colors.magenta;
    ctx.beginPath();
    ctx.arc(0, -34, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawSlider(ctx, x, y, width, time, techParams, isLeft) {
    const value = isLeft ? techParams?.hapticGain ?? 0.5 : techParams?.flowRate ?? 0.5;
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.stroke();

    const knobX = x + width * value;
    const pulse = 6 + Math.sin(time / 300 + knobX * 0.01) * 2;
    ctx.fillStyle = colors.lime;
    ctx.beginPath();
    ctx.arc(knobX, y, pulse * 0.4, 0, Math.PI * 2);
    ctx.fill();
}

function drawDial(ctx, x, y, time, techParams, isLeft) {
    const metric = isLeft ? techParams?.focusLock ?? 0.4 : techParams?.timelineElasticity ?? 0.6;
    const angle = metric * Math.PI * 1.5 - Math.PI * 0.75;

    ctx.strokeStyle = colors.accentSoft;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 28, Math.PI * 0.25, Math.PI * 1.75);
    ctx.stroke();

    ctx.strokeStyle = colors.magenta;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * 24, y + Math.sin(angle) * 24);
    ctx.stroke();

    const glow = 6 + Math.sin(time / 200 + metric * 10) * 2;
    ctx.fillStyle = `rgba(255, 102, 204, 0.4)`;
    ctx.beginPath();
    ctx.arc(x, y, glow, 0, Math.PI * 2);
    ctx.fill();
}

function drawSwitchMatrix(ctx, x, y, width, height, time, techParams) {
    const rows = 2;
    const cols = 3;
    const toggleStates = techParams?.macroLatch ?? [0.3, 0.7, 0.2, 0.8, 0.5, 0.4];

    const cellW = width / cols;
    const cellH = height / rows;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const idx = r * cols + c;
            const active = toggleStates[idx] ?? 0.5;
            const cellX = x + c * cellW;
            const cellY = y + r * cellH;

            ctx.strokeStyle = colors.accentSoft;
            ctx.strokeRect(cellX, cellY, cellW - 6, cellH - 6);

            const heightFill = (cellH - 10) * active;
            ctx.fillStyle = colors.lime;
            ctx.fillRect(cellX + 3, cellY + cellH - 5 - heightFill, cellW - 12, heightFill);

            const pulse = Math.sin(time / 400 + idx) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(0, 183, 255, ${0.2 + pulse * 0.3})`;
            ctx.fillRect(cellX + 3, cellY + 3, cellW - 12, 6);
        }
    }
}

function drawAITicker(ctx, width, height, time, systemData, techParams) {
    const tickerHeight = 54;
    const y = height - tickerHeight - 40;

    ctx.fillStyle = colors.slate;
    ctx.fillRect(60, y, width - 120, tickerHeight);

    ctx.strokeStyle = colors.cardBorder;
    ctx.strokeRect(60, y, width - 120, tickerHeight);

    const entries = systemData?.aiSuggestions ?? getFallbackSuggestions();
    const combined = entries
        .map((entry) => `${entry.label}: ${entry.detail}`)
        .join("  •  ");

    const scrollWidth = ctx.measureText(combined).width + width;
    const offset = (time / 10) % scrollWidth;

    ctx.save();
    ctx.beginPath();
    ctx.rect(64, y + 8, width - 128, tickerHeight - 16);
    ctx.clip();

    ctx.font = fonts.terminal;
    ctx.fillStyle = colors.lime;
    ctx.fillText(combined, 64 - offset, y + tickerHeight / 2 + 4);
    ctx.fillText(combined, 64 - offset + scrollWidth, y + tickerHeight / 2 + 4);

    ctx.restore();

    ctx.font = fonts.mini;
    ctx.fillStyle = colors.accent;
    const latency = (techParams?.latency ?? 18).toFixed(0);
    ctx.fillText(`LAT ${latency}ms`, 70, y + 16);
    ctx.fillText(`CO-MODE ${techParams?.collaborationMode ?? "SYNC"}`, width - 180, y + 16);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    if (!text) {
        return;
    }
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

function getFallbackStages() {
    return [
        {
            title: "IMMERSIVE MOOD BOARD",
            timestamp: "09:42",
            status: "IN PROGRESS",
            aiAssist: 0.68,
            momentum: 0.54,
            preview: "Mapping shader palettes across cinematic beats.",
        },
        {
            title: "CODE AGENT REVIEW",
            timestamp: "08:30",
            status: "AI CO-EDIT",
            aiAssist: 0.82,
            momentum: 0.76,
            preview: "Synthesizing fixes for navigation latency spikes.",
        },
        {
            title: "METAVERSE CLIENT CALL",
            timestamp: "07:05",
            status: "ARCHIVED",
            aiAssist: 0.35,
            momentum: 0.34,
            preview: "Decisions stored; highlights ready for replay.",
        },
        {
            title: "SORA 2 STORY CUTS",
            timestamp: "05:55",
            status: "PAUSED",
            aiAssist: 0.58,
            momentum: 0.42,
            preview: "Sequencing kinetic shots with procedural lighting.",
        },
    ];
}

function getFallbackSuggestions() {
    return [
        { label: "AI GLIDE", detail: "Prepping focus presets for next sprint." },
        { label: "HYPERTHREAD", detail: "Routing collaborator stream to left wall." },
        { label: "CONTEXT VAULT", detail: "Archived edit nodes kept in sync." },
    ];
}
